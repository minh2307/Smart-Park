package com.smartpark.integration.payment.payos.service;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.service.BookingService;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.repository.PaymentRepository;
import com.smartpark.domain.order.service.OrderService;
import com.smartpark.integration.payment.payos.entity.WebhookLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.WebhookData;
import vn.payos.type.Webhook;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSWebhookService {

    private final PayOSGateway payOSGateway;
    private final WebhookLogService webhookLogService;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final BookingService bookingService;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    @Transactional
    public void processWebhook(Webhook webhook) {
        WebhookData data;
        try {
            data = payOSGateway.verifyWebhookData(webhook);
        } catch (Exception e) {
            log.error("[PAYOS WEBHOOK] Signature validation failed", e);
            throw new RuntimeException("Webhook signature validation failed", e);
        }

        String eventId = String.valueOf(data.getOrderCode()) + "-" + data.getPaymentLinkId();
        String transactionId = data.getReference();
        
        WebhookLog logEntry = webhookLogService.logReceived("PAYOS", eventId, String.valueOf(data.getOrderCode()), transactionId, true);

        if (logEntry.getProcessingStatus() == WebhookLog.ProcessingStatus.PROCESSED) {
            log.info("[PAYOS WEBHOOK] Duplicate webhook ignored. EventId: {}", eventId);
            return;
        }

        try {
            // Find payment by providerTransactionId which we set to orderCode
            Optional<Payment> optionalPayment = paymentRepository.findByProviderTransactionId(String.valueOf(data.getOrderCode()));
            
            if (optionalPayment.isEmpty()) {
                log.error("[PAYOS WEBHOOK] Payment not found for orderCode: {}", data.getOrderCode());
                webhookLogService.markFailed(logEntry.getId());
                return;
            }

            Payment payment = optionalPayment.get();
            Order order = payment.getOrder();

            if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
                log.info("[PAYOS WEBHOOK] Payment already processed. OrderCode: {}", data.getOrderCode());
                webhookLogService.markIgnored(logEntry.getId());
                return;
            }

            // Verify amount
            if (payment.getAmount().intValue() != data.getAmount()) {
                log.error("[PAYOS WEBHOOK] Amount mismatch. Expected: {}, Actual: {}", payment.getAmount(), data.getAmount());
                webhookLogService.markFailed(logEntry.getId());
                return;
            }

            if ("00".equals(data.getCode())) {
                // Success
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setPaymentTime(LocalDateTime.now());
                payment.setPaidAt(LocalDateTime.now());
                payment.setProviderStatus("PAID");
                paymentRepository.save(payment);

                orderService.confirmPayment(order.getOrderCode());

                if (order.getBookingId() != null) {
                    bookingService.updateStatus(order.getBookingId(), Booking.BookingStatus.PAID);
                }

                log.info("[PAYOS WEBHOOK] Successfully processed payment for orderCode: {}", data.getOrderCode());
                
                // Analytics
                analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.PAYMENT_COMPLETED,
                    order.getCustomer() != null ? order.getCustomer().getId() : null,
                    "Payment",
                    payment.getId(),
                    payment.getAmount(),
                    Map.of("provider", "PAYOS")
                );
            } else {
                // Failed
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setProviderStatus("FAILED");
                payment.setFailureReason(data.getDesc());
                paymentRepository.save(payment);

                log.error("[PAYOS WEBHOOK] Payment failed. Reason: {}", data.getDesc());
                
                analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.PAYMENT_FAILED,
                    order.getCustomer() != null ? order.getCustomer().getId() : null,
                    "Payment",
                    payment.getId(),
                    payment.getAmount(),
                    Map.of("reason", data.getDesc())
                );
            }

            webhookLogService.markProcessed(logEntry.getId());

        } catch (Exception e) {
            log.error("[PAYOS WEBHOOK] Error processing webhook", e);
            webhookLogService.markFailed(logEntry.getId());
            throw e;
        }
    }
}
