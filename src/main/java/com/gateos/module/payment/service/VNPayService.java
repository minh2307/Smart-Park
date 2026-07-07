package com.gateos.module.payment.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.ticket.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final OrderRepository orderRepository;
    private final TicketService ticketService;

    @Value("${app.vnpay.tmn-code}")
    private String tmnCode;

    @Value("${app.vnpay.hash-secret}")
    private String hashSecret;

    @Value("${app.vnpay.pay-url}")
    private String payUrl;

    @Value("${app.vnpay.return-url}")
    private String returnUrl;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(String orderCode, String ipAddress) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> BusinessException.notFound("Đơn hàng không tồn tại", "ERR-ORD-003"));

        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING) {
            throw BusinessException.badRequest("Đơn hàng không ở trạng thái chờ thanh toán", "ERR-PAY-002");
        }

        String vnpCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String vnpTxnRef = orderCode;
        long amount = order.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        vnpParams.put("vnp_OrderType", "250000");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", ipAddress);
        vnpParams.put("vnp_CreateDate", vnpCreateDate);

        String queryString = buildQueryString(vnpParams);
        String secureHash = hmacSHA512(hashSecret, queryString);

        return payUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    /**
     * Xử lý IPN Webhook từ VNPay (BR-PAY-01)
     */
    @Transactional
    public Map<String, String> processIPN(HttpServletRequest request) {
        Map<String, String> vnpParams = new HashMap<>();
        request.getParameterNames().asIterator().forEachRemaining(name -> {
            if (name.startsWith("vnp_")) {
                vnpParams.put(name, request.getParameter(name));
            }
        });

        String receivedHash = vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        String calculatedHash = hmacSHA512(hashSecret, buildQueryString(new TreeMap<>(vnpParams)));

        if (!calculatedHash.equalsIgnoreCase(receivedHash)) {
            log.warn("VNPay IPN - Invalid signature");
            return Map.of("RspCode", "97", "Message", "Invalid Signature");
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String txnRef = vnpParams.get("vnp_TxnRef");
        String transactionNo = vnpParams.get("vnp_TransactionNo");

        Order order = orderRepository.findByOrderCode(txnRef).orElse(null);
        if (order == null) {
            return Map.of("RspCode", "01", "Message", "Order Not Found");
        }
        if (order.getPaymentStatus() == Order.PaymentStatus.PAID) {
            return Map.of("RspCode", "02", "Message", "Order Already Confirmed");
        }

        if ("00".equals(responseCode)) {
            // Thanh toán thành công
            order.setPaymentStatus(Order.PaymentStatus.PAID);
            order.setPaymentMethod("VNPAY");
            order.setPaymentTransactionId(transactionNo);
            order.setPaymentTime(LocalDateTime.now());
            orderRepository.save(order);

            // Sinh vé và nạp Redis (BR-PAY-03)
            try {
                ticketService.generateTicketsForOrder(order);
                log.info("Tickets generated for order: {}", txnRef);
            } catch (Exception e) {
                log.error("Failed to generate tickets for order: {}", txnRef, e);
            }

            return Map.of("RspCode", "00", "Message", "Confirm Success");
        } else {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            orderRepository.save(order);
            return Map.of("RspCode", "00", "Message", "Confirm Success");
        }
    }

    // =================== HELPERS ===================

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        params.entrySet().stream()
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .forEach(e -> {
                    if (sb.length() > 0) sb.append("&");
                    sb.append(URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII));
                    sb.append("=");
                    sb.append(URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII));
                });
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("HmacSHA512 error", e);
        }
    }
}
