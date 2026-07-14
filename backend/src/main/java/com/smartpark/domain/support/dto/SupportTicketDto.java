package com.smartpark.domain.support.dto;

import com.smartpark.domain.support.entity.SupportTicket.TicketPriority;
import com.smartpark.domain.support.entity.SupportTicket.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class SupportTicketDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        private String subject;

        @NotBlank(message = "Nội dung chi tiết không được để trống")
        private String description;

        private TicketPriority priority;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        private String subject;

        @NotBlank(message = "Nội dung chi tiết không được để trống")
        private String description;

        private TicketPriority priority;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AssignRequest {
        @NotNull(message = "ID nhân viên được phân công không được để trống")
        private Long employeeId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CloseRequest {
        @NotBlank(message = "Nội dung giải quyết không được để trống")
        private String resolution;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CommentRequest {
        @NotBlank(message = "Nội dung bình luận không được để trống")
        private String comment;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CommentResponse {
        private Long id;
        private Long userId;
        private String username;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String ticketNumber;
        private Long customerId;
        private String customerName;
        private String subject;
        private String description;
        private TicketPriority priority;
        private Long assignedEmployeeId;
        private String assignedEmployeeName;
        private TicketStatus status;
        private String resolution;
        private LocalDateTime closedDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String createdBy;
        private String updatedBy;
        private List<CommentResponse> comments;
    }
}
