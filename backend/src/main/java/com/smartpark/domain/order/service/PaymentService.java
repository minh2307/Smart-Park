package com.smartpark.domain.order.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;

import com.smartpark.domain.booking.service.BookingService;
import com.smartpark.domain.order.dto.PaymentDto;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.entity.PaymentMethod;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.order.repository.PaymentMethodRepository;
import com.smartpark.domain.order.repository.PaymentRepository;
import com.smartpark.domain.order.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderService orderService;
    private final BookingService bookingService;

    private final RefundRepository refundRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    /**
     * Tạo giao dịch thanh toán và trả về URL payment gateway.
     */
    @Transactional
    public PaymentDto.PaymentResponse createPayment(PaymentDto.PaymentRequest request) {
        Order order = orderService.findByCode(request.getOrderCode());

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new ConflictException("ERR-PAY-001", "Chỉ có thể thanh toán đơn hàng PENDING.");
        }

        PaymentMethod method = paymentMethodRepository.findByCode(request.getPaymentMethodCode())
                .orElseThrow(() -> new ResourceNotFoundException("PaymentMethod", request.getPaymentMethodCode()));

        if (method.getStatus() != PaymentMethod.PaymentMethodStatus.ACTIVE) {
            throw new BusinessException("ERR-PAY-002", "Phương thức thanh toán này đang bảo trì.");
        }

        // Tạo record payment
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .amount(order.getTotalAmount())
                .status(Payment.PaymentStatus.PENDING)
                // Transaction Ref: kết hợp orderCode và timestamp để đảm bảo unique mỗi lần thử lại
                .transactionReference(order.getOrderCode() + "-" + System.currentTimeMillis())
                .build();

        paymentRepository.save(payment);

        String paymentUrl = "";
        if ("PAYOS".equalsIgnoreCase(method.getCode()) || "VNPAY".equalsIgnoreCase(method.getCode())) {
            throw new BusinessException("ERR-PAY-003", "Vui lòng sử dụng API mới: /api/v1/integration/payment/payos/payment-links");
        } else if ("MOMO".equalsIgnoreCase(method.getCode())) {
            // TODO: implement MoMo
            paymentUrl = "https://momo.vn/mock-url/" + payment.getTransactionReference();
        } else {
            throw new BusinessException("ERR-PAY-003", "Phương thức thanh toán không được hỗ trợ để tạo URL.");
        }

        log.info("[PAYMENT CREATED] orderCode={} txRef={} method={}",
                order.getOrderCode(), payment.getTransactionReference(), method.getCode());

        PaymentDto.PaymentResponse response = new PaymentDto.PaymentResponse();
        response.setPaymentUrl(paymentUrl);
        return response;
    }



    // ──────────────────────────── REFUND LOGIC ─────────────────────────────

    @Transactional
    public Refund requestRefund(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new ConflictException("ERR-PAY-004", "Chỉ có thể hoàn tiền cho giao dịch SUCCESS.");
        }

        Refund refund = Refund.builder()
                .payment(payment)
                .amount(payment.getAmount()) // Mặc định hoàn toàn bộ
                .reason(reason)
                .status(Refund.RefundStatus.PENDING)
                .build();

        log.info("[REFUND REQUESTED] paymentId={} amount={} reason={}", paymentId, payment.getAmount(), reason);
        return refundRepository.save(refund);
    }

    @Transactional
    public Refund approveRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund", refundId));

        if (refund.getStatus() != Refund.RefundStatus.PENDING) {
            throw new ConflictException("ERR-PAY-005", "Chỉ có thể duyệt hoàn tiền ở trạng thái PENDING.");
        }

        Payment payment = refund.getPayment();
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        refund.setStatus(Refund.RefundStatus.APPROVED);
        Refund saved = refundRepository.save(refund);

        // TODO: Call Gateway API (VNPay/MoMo/Stripe) to process the actual refund.
        // Once Gateway replies success, update status to COMPLETED. 
        // For now, we simulate success.
        
        saved.setStatus(Refund.RefundStatus.COMPLETED);
        refundRepository.save(saved);

        // Có thể cần gọi bookingService/ticketService để cancel nếu chưa cancel
        if (payment.getOrder().getBookingId() != null) {
            bookingService.cancel(payment.getOrder().getOrderCode(), "Hoàn tiền được duyệt: " + refund.getReason());
        }

        // Trigger REFUND_ISSUED
        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.REFUND_ISSUED,
                payment.getOrder().getCustomer().getId(),
                "Refund",
                refund.getId(),
                refund.getAmount(),
                Map.of(
                        "paymentId", payment.getId(),
                        "bookingId", payment.getOrder().getBookingId() != null ? payment.getOrder().getBookingId() : "",
                        "reason", refund.getReason()
                )
        );

        log.info("[REFUND APPROVED] refundId={} paymentId={}", refundId, payment.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethod> getActivePaymentMethods() {
        return paymentMethodRepository.findAll().stream()
                .filter(m -> m.getStatus() == PaymentMethod.PaymentMethodStatus.ACTIVE)
                .toList();
    }
}
