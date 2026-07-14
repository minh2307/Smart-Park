package com.smartpark.domain.locker.dto;

import com.smartpark.domain.locker.entity.Locker.LockerSize;
import com.smartpark.domain.locker.entity.Locker.LockerStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerResponseDto {
    private Long id;
    private Long zoneId;
    private String zoneName;
    private String lockerCode;
    private String lockerNumber;
    private String type;
    private BigDecimal rentalPrice;
    private LockerSize size;
    private LockerStatus status;
    private String location;
    private String qrCode;
    private Boolean currentAvailability;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
