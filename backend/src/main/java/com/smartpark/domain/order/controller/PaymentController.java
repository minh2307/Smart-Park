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
}
