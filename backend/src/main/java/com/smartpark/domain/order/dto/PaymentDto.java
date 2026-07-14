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

}
