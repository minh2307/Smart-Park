package com.smartpark.domain.parking.dto;

import com.smartpark.domain.parking.entity.Gate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO cho Gate entity — wrapper class pattern.
 */
public class GateDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "Mã cổng không được để trống")
        @Size(max = 50, message = "Mã cổng không quá 50 ký tự")
        @Pattern(regexp = "^[A-Z0-9_]+$", message = "Mã cổng chỉ gồm chữ hoa, số và dấu gạch dưới")
        private String code;

        @NotBlank(message = "Tên cổng không được để trống")
        @Size(max = 150, message = "Tên cổng không quá 150 ký tự")
        private String name;

        @NotNull(message = "Loại cổng không được để trống")
        private Gate.GateType type;

        private Gate.GateStatus status;

        /** ID của parking area (có thể null) */
        private Long parkingAreaId;

        /** ID của zone (có thể null) */
        private Long zoneId;

        @Size(max = 5000)
        private String description;

        /** JSON string thiết bị kết nối */
        @Size(max = 500)
        private String deviceInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @Size(max = 150)
        private String name;

        private Gate.GateType type;

        private Long parkingAreaId;

        private Long zoneId;

        @Size(max = 5000)
        private String description;

        @Size(max = 500)
        private String deviceInfo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusRequest {
        @NotNull(message = "Trạng thái không được để trống")
        private Gate.GateStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String code;
        private String name;
        private Gate.GateType type;
        private Gate.GateStatus status;
        private Long parkingAreaId;
        private String parkingAreaName;
        private Long zoneId;
        private String zoneName;
        private String description;
        private String deviceInfo;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
