package com.smartpark.domain.parking.dto;

import com.smartpark.domain.parking.entity.ParkingTransaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho Parking Session (ParkingTransaction entity).
 */
public class ParkingSessionDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInRequest {

        @NotBlank(message = "Biển số xe không được để trống")
        @Size(max = 20, message = "Biển số xe không quá 20 ký tự")
        @Pattern(regexp = "^[A-Z0-9\\-\\.]+$", message = "Biển số xe chỉ gồm chữ hoa, số, dấu gạch ngang và chấm")
        private String licensePlate;

        @NotNull(message = "Loại phương tiện không được để trống")
        private ParkingTransaction.VehicleType vehicleType;

        @NotNull(message = "Parking area ID không được để trống")
        private Long parkingAreaId;

        /** Gate vào — có thể null nếu nhập thủ công */
        private Long entryGateId;

        @Size(max = 500)
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckOutRequest {

        @NotBlank(message = "Biển số xe không được để trống")
        @Size(max = 20)
        private String licensePlate;

        /** Gate ra — có thể null */
        private Long exitGateId;

        /** Số tiền thực trả (nếu khác parkingFee tự tính) */
        private BigDecimal amountPaid;

        private ParkingTransaction.PaymentStatus paymentStatus;

        @Size(max = 500)
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long parkingAreaId;
        private String parkingAreaName;
        private Long entryGateId;
        private String entryGateCode;
        private Long exitGateId;
        private String exitGateCode;
        private String licensePlate;
        private ParkingTransaction.VehicleType vehicleType;
        private LocalDateTime entryTime;
        private LocalDateTime exitTime;
        private Long durationMinutes;
        private BigDecimal parkingFee;
        private BigDecimal amountPaid;
        private ParkingTransaction.PaymentStatus paymentStatus;
        private ParkingTransaction.ParkingStatus status;
        private String notes;
    }
}
