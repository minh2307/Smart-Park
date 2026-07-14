package com.smartpark.domain.notification.dto;

import com.smartpark.domain.notification.entity.Notification.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class NotificationTemplateDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Mã mẫu thông báo không được để trống")
        @Size(max = 100, message = "Mã mẫu không vượt quá 100 ký tự")
        private String templateCode;

        @NotBlank(message = "Tên mẫu thông báo không được để trống")
        @Size(max = 150, message = "Tên mẫu không vượt quá 150 ký tự")
        private String templateName;

        @NotNull(message = "Kênh gửi không được để trống")
        private NotificationType channel;

        private String subject;

        @NotBlank(message = "Nội dung mẫu không được để trống")
        private String body;

        private String variables; // comma separated variables like: name, otp

        @Builder.Default
        private boolean active = true;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @NotBlank(message = "Tên mẫu thông báo không được để trống")
        @Size(max = 150, message = "Tên mẫu không vượt quá 150 ký tự")
        private String templateName;

        @NotNull(message = "Kênh gửi không được để trống")
        private NotificationType channel;

        private String subject;

        @NotBlank(message = "Nội dung mẫu không được để trống")
        private String body;

        private String variables;
        private boolean active;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String templateCode;
        private String templateName;
        private NotificationType channel;
        private String subject;
        private String body;
        private String variables;
        private boolean active;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
        private String updatedBy;
    }
}
