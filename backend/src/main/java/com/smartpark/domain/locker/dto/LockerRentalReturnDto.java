package com.smartpark.domain.locker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerRentalReturnDto {

    @NotNull(message = "ID giao dịch thuê tủ không được để trống")
    private Long rentalId;

    @Builder.Default
    private BigDecimal penalty = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal damageFee = BigDecimal.ZERO;
}
