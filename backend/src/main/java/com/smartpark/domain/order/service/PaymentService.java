package com.smartpark.domain.order.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.config.VNPayConfig;
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
    private final VNPayConfig vnPayConfig;
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
        if ("VNPAY".equalsIgnoreCase(method.getCode())) {
            paymentUrl = createVNPayUrl(payment);
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

    /**
     * Xử lý IPN Webhook từ VNPay gửi về.
     */
    @Transactional
    public String processVNPayIpn(Map<String, String> requestParams) {
        log.info("[VNPAY IPN] Received IPN webhook: {}", requestParams);

        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return "{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}";
        }
        
        requestParams.remove("vnp_SecureHash");
        requestParams.remove("vnp_SecureHashType");

        // Hash data
        List<String> fieldNames = new ArrayList<>(requestParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        try {
            for (String fieldName : fieldNames) {
                String fieldValue = requestParams.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
                }
            }
            if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
        } catch (Exception e) {
            log.error("Error creating hash data", e);
        }

        String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        
        // 1. Verify Checksum (Chữ ký điện tử)
        if (!secureHash.equals(vnp_SecureHash)) {
            log.warn("[VNPAY IPN] Checksum failed.");
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}";
        }

        String vnp_TxnRef = requestParams.get("vnp_TxnRef");
        String vnp_ResponseCode = requestParams.get("vnp_ResponseCode");

        Optional<Payment> optionalPayment = paymentRepository.findByTransactionReferenceForUpdate(vnp_TxnRef);
        
        // 2. Order Not Found
        if (optionalPayment.isEmpty()) {
            log.warn("[VNPAY IPN] Transaction {} not found.", vnp_TxnRef);
            return "{\"RspCode\":\"01\",\"Message\":\"Order not found\"}";
        }

        Payment payment = optionalPayment.get();
        Order order = payment.getOrder();

        // 3. Verify Amount
        long vnp_Amount = Long.parseLong(requestParams.get("vnp_Amount")) / 100;
        if (payment.getAmount().longValue() != vnp_Amount) {
            log.warn("[VNPAY IPN] Invalid amount. TxRef: {}, DB: {}, VNP: {}", vnp_TxnRef, payment.getAmount(), vnp_Amount);
            return "{\"RspCode\":\"04\",\"Message\":\"Invalid amount\"}";
        }

        // 4. Order Already Confirmed
        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            log.warn("[VNPAY IPN] Order already confirmed. TxRef: {}", vnp_TxnRef);
            return "{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}";
        }

        // 5. Update Status
        if ("00".equals(vnp_ResponseCode)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaymentTime(LocalDateTime.now());
            paymentRepository.save(payment);

            // Confirm order
            orderService.confirmPayment(order.getOrderCode());

            // If this order is linked to a booking, confirm the booking
            if (order.getBookingId() != null) {
                // Giả định order.getBookingId() lưu trữ id của Booking
                bookingService.updateStatus(order.getBookingId(), com.smartpark.domain.booking.entity.Booking.BookingStatus.PAID);
            }

            log.info("[VNPAY IPN] Transaction {} SUCCESS.", vnp_TxnRef);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            // Có thể hủy Order hoặc giữ PENDING để user thử lại tùy nghiệp vụ
            log.info("[VNPAY IPN] Transaction {} FAILED with code {}.", vnp_TxnRef, vnp_ResponseCode);

            // Trigger PAYMENT_FAILED
            analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.PAYMENT_FAILED,
                    order.getCustomer().getId(),
                    "Payment",
                    payment.getId(),
                    payment.getAmount(),
                    Map.of("reason", "VNPAY response code: " + vnp_ResponseCode)
            );
        }

        return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
    }

    private String createVNPayUrl(Payment payment) {
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        // vnp_Amount: số tiền nhân với 100
        long amount = payment.getAmount().longValue() * 100;
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", payment.getTransactionReference());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + payment.getOrder().getOrderCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnp_Params.put("vnp_IpAddr", "127.0.0.1"); // Thực tế lấy từ request.getRemoteAddr()

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = LocalDateTime.now().format(formatter);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        // Hạn thanh toán 15 phút
        String vnp_ExpireDate = LocalDateTime.now().plusMinutes(15).format(formatter);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build URL
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        try {
            for (String fieldName : fieldNames) {
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8)).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
                }
            }
            if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
            if (query.length() > 0) query.setLength(query.length() - 1);
        } catch (Exception e) {
            log.error("Error building VNPay URL", e);
        }

        String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);
        
        return vnPayConfig.getVnpPayUrl() + "?" + query.toString();
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
