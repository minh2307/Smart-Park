package com.smartpark.domain.locker.dto;

import com.smartpark.domain.locker.entity.Locker.LockerSize;
import com.smartpark.domain.locker.entity.Locker.LockerStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LockerRequestDto {

    @NotNull(message = "ID phân khu không được để trống")
    private Long zoneId;

    @NotBlank(message = "Mã tủ đồ không được để trống")
    private String lockerCode;

    @NotBlank(message = "Số tủ đồ không được để trống")
    private String lockerNumber;

    @Builder.Default
    private String type = "STANDARD";

    @NotNull(message = "Giá thuê không được để trống")
    private BigDecimal rentalPrice;

    @NotNull(message = "Kích thước không được để trống")
    private LockerSize size;

    private LockerStatus status;

    private String location;

    private String qrCode;

    @Builder.Default
    private Boolean currentAvailability = true;
}
