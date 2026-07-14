package com.smartpark.domain.complaint.dto;

import com.smartpark.domain.complaint.entity.Complaint.ComplaintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class ComplaintDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "Loại khiếu nại không được để trống")
        private String complaintType;

        @NotBlank(message = "Mô tả chi tiết khiếu nại không được để trống")
        private String description;

        private String evidence;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResolveRequest {
        @NotBlank(message = "Nội dung giải quyết khiếu nại không được để trống")
        private String resolution;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RejectRequest {
        @NotBlank(message = "Lý do từ chối khiếu nại không được để trống")
        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class HistoryResponse {
        private Long id;
        private String statusFrom;
        private String statusTo;
        private String actionDetails;
        private Long performedById;
        private String performedByUsername;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String complaintNumber;
        private Long customerId;
        private String customerName;
        private String complaintType;
        private String description;
        private String evidence;
        private Long assignedStaffId;
        private String assignedStaffName;
        private String resolution;
        private ComplaintStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<HistoryResponse> history;
    }
}
