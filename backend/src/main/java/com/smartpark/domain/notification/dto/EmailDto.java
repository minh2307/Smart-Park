package com.smartpark.domain.notification.dto;

import com.smartpark.domain.notification.entity.EmailHistory.SendStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class EmailDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SendRequest {
        @NotBlank(message = "Địa chỉ email người nhận không được để trống")
        @Email(message = "Địa chỉ email không hợp lệ")
        private String recipient;

        @NotBlank(message = "Tiêu đề email không được để trống")
        private String subject;

        @NotBlank(message = "Nội dung email không được để trống")
        private String htmlContent;

        private String attachmentPath;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkSendRequest {
        @NotEmpty(message = "Danh sách email nhận không được rỗng")
        private List<@Email(message = "Địa chỉ email không hợp lệ") String> recipients;

        @NotBlank(message = "Tiêu đề email không được để trống")
        private String subject;

        @NotBlank(message = "Nội dung email không được để trống")
        private String htmlContent;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String recipient;
        private String subject;
        private String htmlContent;
        private String attachmentPath;
        private SendStatus sendStatus;
        private LocalDateTime sentAt;
        private String errorMessage;
        private int retryCount;
    }
}
