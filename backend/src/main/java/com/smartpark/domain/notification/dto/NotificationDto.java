package com.smartpark.domain.notification.dto;

import com.smartpark.domain.notification.entity.Notification.NotificationPriority;
import com.smartpark.domain.notification.entity.Notification.NotificationStatus;
import com.smartpark.domain.notification.entity.Notification.NotificationType;
import com.smartpark.domain.notification.entity.NotificationRecipient.DeliveryStatus;
import com.smartpark.domain.notification.entity.NotificationRecipient.ReadStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class NotificationDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 200, message = "Tiêu đề không vượt quá 200 ký tự")
        private String title;

        @NotBlank(message = "Nội dung không được để trống")
        private String content;

        @NotNull(message = "Loại thông báo không được để trống")
        private NotificationType type;

        @Builder.Default
        private NotificationPriority priority = NotificationPriority.MEDIUM;

        private LocalDateTime expirationTime;

        private List<Long> userIds;
        private List<Long> customerIds;
        private List<Long> employeeIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 200, message = "Tiêu đề không vượt quá 200 ký tự")
        private String title;

        @NotBlank(message = "Nội dung không được để trống")
        private String content;

        private NotificationPriority priority;
        private LocalDateTime expirationTime;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private NotificationType type;
        private NotificationPriority priority;
        private NotificationStatus status;
        private LocalDateTime expirationTime;
        private LocalDateTime createdAt;
        private String createdBy;
        private List<RecipientResponse> recipients;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecipientResponse {
        private Long id;
        private Long userId;
        private String username;
        private Long customerId;
        private String customerName;
        private Long employeeId;
        private String employeeName;
        private ReadStatus readStatus;
        private LocalDateTime readAt;
        private DeliveryStatus deliveryStatus;
        private LocalDateTime deliveredAt;
        private String errorMessage;
    }
}
