package com.smartpark.domain.locker.dto;

import com.smartpark.domain.locker.entity.LockerMaintenance.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerMaintenanceRequestDto {

    @NotNull(message = "ID tủ đồ không được để trống")
    private Long lockerId;

    @NotNull(message = "Ngày bảo trì không được để trống")
    private LocalDateTime maintenanceDate;

    private String reason;

    private String technician;

    private LocalDateTime completionDate;

    private MaintenanceStatus maintenanceStatus;
}
