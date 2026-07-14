package com.smartpark.domain.notification.dto;

import com.smartpark.domain.notification.entity.PushHistory.SendStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class PushDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SendRequest {
        @NotBlank(message = "Device token không được để trống")
        private String deviceToken;

        private String topic;

        @NotBlank(message = "Tiêu đề không được để trống")
        private String title;

        @NotBlank(message = "Nội dung tin nhắn push không được để trống")
        private String message;

        private String imageUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkSendRequest {
        @NotEmpty(message = "Danh sách device token không được rỗng")
        private List<String> deviceTokens;

        private String topic;

        @NotBlank(message = "Tiêu đề không được để trống")
        private String title;

        @NotBlank(message = "Nội dung tin nhắn push không được để trống")
        private String message;

        private String imageUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String deviceToken;
        private String topic;
        private String title;
        private String message;
        private String imageUrl;
        private SendStatus sendStatus;
        private LocalDateTime sentAt;
        private String errorMessage;
    }
}
