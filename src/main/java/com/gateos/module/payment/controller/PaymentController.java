package com.gateos.module.payment.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.payment.service.VNPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Thanh toán VNPay và xử lý callback")
public class PaymentController {

    private final VNPayService vnPayService;

    @Operation(summary = "Tạo URL thanh toán VNPay")
    @PostMapping("/create-url")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentUrl(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String orderCode = body.get("orderCode");
        String ipAddress = getClientIp(request);
        String paymentUrl = vnPayService.createPaymentUrl(orderCode, ipAddress);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("paymentUrl", paymentUrl), "Tạo URL thanh toán thành công"));
    }

    @Operation(summary = "Webhook IPN từ VNPay (hệ thống gọi về)")
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIPN(HttpServletRequest request) {
        Map<String, String> result = vnPayService.processIPN(request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Trang kết quả sau khi khách hàng thanh toán (VNPay redirect)")
    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<Map<String, String>>> vnpayReturn(HttpServletRequest request) {
        String responseCode = request.getParameter("vnp_ResponseCode");
        String orderCode = request.getParameter("vnp_TxnRef");
        if ("00".equals(responseCode)) {
            return ResponseEntity.ok(ApiResponse.ok(
                    Map.of("orderCode", orderCode, "status", "SUCCESS"),
                    "Thanh toán thành công"));
        }
        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("orderCode", orderCode, "status", "FAILED"),
                "Thanh toán thất bại"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
