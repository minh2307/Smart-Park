package com.smartpark.integration.payment.payos.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.integration.payment.payos.service.PayOSWebhookService;
import com.smartpark.integration.payment.payos.service.PaymentLinkService;
import com.smartpark.integration.payment.payos.service.PaymentStatusSynchronizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integration/payment/payos")
@RequiredArgsConstructor
@Slf4j
public class PayOSController {

    private final PaymentLinkService paymentLinkService;
    private final PayOSWebhookService webhookService;
    private final PaymentStatusSynchronizer statusSynchronizer;

    @PostMapping("/payment-links")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<String>> createPaymentLink(@RequestBody Map<String, String> request) {
        String orderCode = request.get("orderCode");
        String url = paymentLinkService.createPaymentLink(orderCode);
        return ResponseEntity.ok(ApiResponse.success(url));
    }

    @GetMapping("/payment-links/{orderCode}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentLinkData>> getPaymentLinkStatus(@PathVariable String orderCode) {
        statusSynchronizer.syncStatus(orderCode);
        PaymentLinkData data = paymentLinkService.getPaymentLinkStatus(orderCode);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/payment-links/{orderCode}/cancel")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PaymentLinkData>> cancelPaymentLink(@PathVariable String orderCode) {
        PaymentLinkData data = paymentLinkService.cancelPaymentLink(orderCode);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody Webhook webhook) {
        log.info("[PAYOS WEBHOOK] Received webhook: {}", webhook);
        try {
            webhookService.processWebhook(webhook);
            return ResponseEntity.ok(Map.of(
                    "error", 0,
                    "message", "Ok",
                    "data", null
            ));
        } catch (Exception e) {
            log.error("[PAYOS WEBHOOK] Failed to process webhook", e);
            return ResponseEntity.ok(Map.of(
                    "error", 1,
                    "message", e.getMessage(),
                    "data", null
            ));
        }
    }

    @GetMapping("/return")
    public ResponseEntity<Void> handleReturn(
            @RequestParam("code") String code,
            @RequestParam("id") String id,
            @RequestParam("cancel") boolean cancel,
            @RequestParam("status") String status,
            @RequestParam("orderCode") String orderCode
    ) {
        log.info("[PAYOS RETURN] code={}, id={}, cancel={}, status={}, orderCode={}", code, id, cancel, status, orderCode);
        
        StringBuilder redirectUrl = new StringBuilder("http://localhost:5173/checkout/payment-result?");
        redirectUrl.append("orderCode=").append(orderCode)
                   .append("&status=").append(status)
                   .append("&cancel=").append(cancel);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl.toString()));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/cancel")
    public ResponseEntity<Void> handleCancel(
            @RequestParam("code") String code,
            @RequestParam("id") String id,
            @RequestParam("cancel") boolean cancel,
            @RequestParam("status") String status,
            @RequestParam("orderCode") String orderCode
    ) {
        log.info("[PAYOS CANCEL] code={}, id={}, cancel={}, status={}, orderCode={}", code, id, cancel, status, orderCode);
        
        StringBuilder redirectUrl = new StringBuilder("http://localhost:5173/checkout/payment-result?");
        redirectUrl.append("orderCode=").append(orderCode)
                   .append("&status=").append(status)
                   .append("&cancel=").append(cancel);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(redirectUrl.toString()));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
