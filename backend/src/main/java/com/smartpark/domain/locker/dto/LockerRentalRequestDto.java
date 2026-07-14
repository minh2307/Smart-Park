package com.smartpark.domain.locker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerRentalRequestDto {

    @NotNull(message = "ID tủ đồ không được để trống")
    private Long lockerId;

    private Long customerId;

    private String customerName;

    @NotNull(message = "Tiền đặt cọc không được để trống")
    private BigDecimal deposit;

    private Integer durationHours;
}
