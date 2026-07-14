package com.smartpark.domain.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanRequestDto {

    @NotBlank(message = "Mã QR không được để trống")
    private String qrCode;

    private Long gateId;

    private Long attractionId;
}
