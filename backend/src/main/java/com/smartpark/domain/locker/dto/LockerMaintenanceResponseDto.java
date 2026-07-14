package com.smartpark.domain.locker.dto;

import com.smartpark.domain.locker.entity.LockerMaintenance.MaintenanceStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerMaintenanceResponseDto {
    private Long id;
    private Long lockerId;
    private String lockerCode;
    private String lockerNumber;
    private LocalDateTime maintenanceDate;
    private String reason;
    private String technician;
    private LocalDateTime completionDate;
    private MaintenanceStatus maintenanceStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
