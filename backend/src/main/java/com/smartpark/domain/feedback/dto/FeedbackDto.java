package com.smartpark.domain.feedback.dto;

import com.smartpark.domain.feedback.entity.Feedback.FeedbackCategory;
import com.smartpark.domain.feedback.entity.Feedback.FeedbackStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class FeedbackDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotNull(message = "Danh mục phản hồi không được để trống")
        private FeedbackCategory category;

        @NotBlank(message = "Nội dung phản hồi không được để trống")
        private String content;

        @NotNull(message = "Đánh giá sao không được để trống")
        @Min(value = 1, message = "Đánh giá sao phải tối thiểu là 1")
        @Max(value = 5, message = "Đánh giá sao tối đa là 5")
        private Integer rating;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        private FeedbackCategory category;
        private String content;
        @Min(value = 1, message = "Đánh giá sao phải tối thiểu là 1")
        @Max(value = 5, message = "Đánh giá sao tối đa là 5")
        private Integer rating;
        private FeedbackStatus status;
        private Long assignedEmployeeId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long customerId;
        private String customerName;
        private FeedbackCategory category;
        private String content;
        private Integer rating;
        private Long assignedEmployeeId;
        private String assignedEmployeeName;
        private FeedbackStatus status;
        private LocalDateTime createdAt;
    }
}
