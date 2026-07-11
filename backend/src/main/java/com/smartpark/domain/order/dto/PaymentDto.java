package com.smartpark.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class PaymentDto {

    @Data
    public static class PaymentRequest {
        @NotBlank
        private String orderCode;

        @NotBlank
        private String paymentMethodCode; // e.g. VNPAY, MOMO
    }

    @Data
    public static class PaymentResponse {
        private String paymentUrl;
    }

    @Data
    public static class VNPayIpnRequest {
        private String vnp_TxnRef;
        private String vnp_Amount;
        private String vnp_OrderInfo;
        private String vnp_ResponseCode;
        private String vnp_TransactionNo;
        private String vnp_BankCode;
        private String vnp_PayDate;
        private String vnp_SecureHash;
    }
}
