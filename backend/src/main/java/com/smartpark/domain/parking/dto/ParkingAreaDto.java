package com.smartpark.domain.parking.dto;

import com.smartpark.domain.parking.entity.ParkingLot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho Parking Area (ParkingLot entity) — wrapper class pattern theo UserDto.
 */
public class ParkingAreaDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Tên bãi đỗ xe không được để trống")
        @Size(max = 150, message = "Tên không quá 150 ký tự")
        private String name;

        @NotNull(message = "Park ID không được để trống")
        private Long parkId;

        @NotNull(message = "Loại phương tiện không được để trống")
        private ParkingLot.VehicleType vehicleType;

        @NotNull(message = "Sức chứa không được để trống")
        @Positive(message = "Sức chứa phải lớn hơn 0")
        private Integer totalSpaces;

        private BigDecimal hourlyRate;

        private BigDecimal dailyRate;

        @Size(max = 5000, message = "Mô tả không quá 5000 ký tự")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 150, message = "Tên không quá 150 ký tự")
        private String name;

        private ParkingLot.VehicleType vehicleType;

        @Positive(message = "Sức chứa phải lớn hơn 0")
        private Integer totalSpaces;

        private BigDecimal hourlyRate;

        private BigDecimal dailyRate;

        @Size(max = 5000)
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusRequest {
        @NotNull(message = "Trạng thái không được để trống")
        private ParkingLot.ParkingLotStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long parkId;
        private String parkName;
        private String name;
        private ParkingLot.VehicleType vehicleType;
        private Integer totalSpaces;
        private Integer occupiedSpaces;
        private Integer availableSpaces;
        private BigDecimal hourlyRate;
        private BigDecimal dailyRate;
        private String description;
        private ParkingLot.ParkingLotStatus status;
        private double occupancyRate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Statistics {
        private Long totalAreas;
        private Long activeAreas;
        private Long fullAreas;
        private Long closedAreas;
        private Integer totalCapacity;
        private Integer totalOccupied;
        private Integer totalAvailable;
        private double overallOccupancyRate;
    }
}
