package com.smartpark.domain.notification.dto;

import com.smartpark.domain.notification.entity.SmsHistory.DeliveryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class SmsDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SendRequest {
        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không đúng định dạng Việt Nam")
        private String phoneNumber;

        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        private String message;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BulkSendRequest {
        @NotEmpty(message = "Danh sách số điện thoại nhận không được rỗng")
        private List<@Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không đúng định dạng Việt Nam") String> phoneNumbers;

        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        private String message;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String phoneNumber;
        private String message;
        private DeliveryStatus deliveryStatus;
        private LocalDateTime sentAt;
        private String errorMessage;
    }
}
