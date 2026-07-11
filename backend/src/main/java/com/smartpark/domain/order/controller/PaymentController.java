package com.smartpark.domain.order.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.order.dto.PaymentDto;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.order.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Client gọi API này để tạo link thanh toán (VNPay / MoMo)
     */
    @PostMapping("/create")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentDto.PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentDto.PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.createPayment(request)));
    }

    /**
     * IPN Webhook dành cho VNPay gọi server-to-server để báo kết quả thanh toán.
     * Lưu ý: Webhook thường nhận các tham số dạng request parameters (Form URL-encoded hoặc Query Params)
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> requestParams) {
        String result = paymentService.processVNPayIpn(requestParams);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{paymentId}/refunds")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Refund>> requestRefund(
            @PathVariable Long paymentId,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.requestRefund(paymentId, reason)));
    }

    @PostMapping("/refunds/{refundId}/approve")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Refund>> approveRefund(@PathVariable Long refundId) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.approveRefund(refundId)));
    }

    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<java.util.List<com.smartpark.domain.order.entity.PaymentMethod>>> getPaymentMethods() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getActivePaymentMethods()));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> requestParams) {
        StringBuilder redirectUrl = new StringBuilder("http://localhost:5173/checkout/payment-result?");
        requestParams.forEach((key, value) -> {
            try {
                redirectUrl.append(key).append("=").append(java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8.toString())).append("&");
            } catch (Exception e) {
                // ignore
            }
        });
        if (redirectUrl.length() > 0 && redirectUrl.charAt(redirectUrl.length() - 1) == '&') {
            redirectUrl.setLength(redirectUrl.length() - 1);
        }

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setLocation(java.net.URI.create(redirectUrl.toString()));
        return new ResponseEntity<>(headers, org.springframework.http.HttpStatus.FOUND);
    }
}
