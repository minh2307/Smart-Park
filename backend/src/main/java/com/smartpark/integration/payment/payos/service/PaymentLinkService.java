package com.smartpark.integration.payment.payos.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.entity.PaymentMethod;
import com.smartpark.domain.order.repository.PaymentMethodRepository;
import com.smartpark.domain.order.repository.PaymentRepository;
import com.smartpark.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentLinkService {

    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderService orderService;
    private final PayOSGateway payOSGateway;

    @Transactional
    public String createPaymentLink(String orderCode) {
        Order order = orderService.findByCode(orderCode);

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new ConflictException("ERR-PAY-001", "Chỉ có thể thanh toán đơn hàng PENDING.");
        }

        PaymentMethod method = paymentMethodRepository.findByCode("PAYOS")
                .orElseGet(() -> paymentMethodRepository.findByCode("VNPAY").orElseThrow(
                        () -> new ResourceNotFoundException("PaymentMethod", "PAYOS")));

        if (method.getStatus() != PaymentMethod.PaymentMethodStatus.ACTIVE) {
            throw new BusinessException("ERR-PAY-002", "Phương thức thanh toán này đang bảo trì.");
        }

        // Generate a numeric order code for PayOS (using timestamp + hash or just saving Payment first to get ID)
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(method)
                .amount(order.getTotalAmount())
                .status(Payment.PaymentStatus.PENDING)
                .provider("PAYOS")
                .orderCode(order.getOrderCode())
                .build();

        payment = paymentRepository.save(payment);

        // PayOS requires numeric order code < 9007199254740991 (max safe integer)
        long payosOrderCode = payment.getId() + 100000L; // Offset to avoid small numbers if needed
        payment.setProviderTransactionId(String.valueOf(payosOrderCode));
        paymentRepository.save(payment);

        String description = "Thanh toan don hang " + orderCode;
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }

        int amount = payment.getAmount().intValue();
        ItemData item = ItemData.builder()
                .name("Don hang " + orderCode)
                .price(amount)
                .quantity(1)
                .build();

        CheckoutResponseData responseData = payOSGateway.createPaymentLink(payosOrderCode, amount, description, Collections.singletonList(item));

        payment.setCheckoutUrl(responseData.getCheckoutUrl());
        payment.setProviderPaymentLinkId(responseData.getPaymentLinkId());
        payment.setQrCode(responseData.getQrCode());
        payment.setProviderStatus(responseData.getStatus());
        paymentRepository.save(payment);

        log.info("[PAYOS] Payment link created for orderCode={} payosOrderCode={}", orderCode, payosOrderCode);

        return responseData.getCheckoutUrl();
    }

    @Transactional
    public vn.payos.type.PaymentLinkData getPaymentLinkStatus(String orderCode) {
        Order order = orderService.findByCode(orderCode);
        Optional<Payment> optionalPayment = paymentRepository.findByOrderAndStatus(order, Payment.PaymentStatus.PENDING).stream().findFirst();
        
        if (optionalPayment.isEmpty()) {
            throw new ResourceNotFoundException("Payment", orderCode);
        }

        Payment payment = optionalPayment.get();
        if (!"PAYOS".equals(payment.getProvider())) {
            throw new BusinessException("ERR-PAY-006", "Payment is not a PayOS payment");
        }

        return payOSGateway.getPaymentLinkInformation(Long.parseLong(payment.getProviderTransactionId()));
    }

    @Transactional
    public vn.payos.type.PaymentLinkData cancelPaymentLink(String orderCode) {
        Order order = orderService.findByCode(orderCode);
        Optional<Payment> optionalPayment = paymentRepository.findByOrderAndStatus(order, Payment.PaymentStatus.PENDING).stream().findFirst();

        if (optionalPayment.isEmpty()) {
            throw new ResourceNotFoundException("Payment", orderCode);
        }

        Payment payment = optionalPayment.get();
        if (!"PAYOS".equals(payment.getProvider())) {
            throw new BusinessException("ERR-PAY-006", "Payment is not a PayOS payment");
        }

        vn.payos.type.PaymentLinkData result = payOSGateway.cancelPaymentLink(Long.parseLong(payment.getProviderTransactionId()), "Customer requested cancellation");
        
        payment.setProviderStatus(result.getStatus());
        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        payment.setCancelledAt(LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("[PAYOS] Payment link cancelled for orderCode={}", orderCode);

        return result;
    }
}
