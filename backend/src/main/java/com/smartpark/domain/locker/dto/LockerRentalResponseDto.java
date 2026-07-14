package com.smartpark.domain.locker.dto;

import com.smartpark.domain.locker.entity.LockerTransaction.LockerTransactionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerRentalResponseDto {
    private Long id;
    private Long lockerId;
    private String lockerCode;
    private Long customerId;
    private String customerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal deposit;
    private BigDecimal rentalFee;
    private BigDecimal amountPaid;
    private BigDecimal penaltyAmount;
    private LockerTransactionStatus status;
    private String paymentStatus;
}
