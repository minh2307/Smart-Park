package com.smartpark.domain.complaint.mapper;

import com.smartpark.domain.complaint.dto.ComplaintDto;
import com.smartpark.domain.complaint.entity.Complaint;
import com.smartpark.domain.complaint.entity.ComplaintHistory;

import java.util.stream.Collectors;

public class ComplaintMapper {

    public static ComplaintDto.Response toResponseDto(Complaint complaint) {
        if (complaint == null) return null;
        return ComplaintDto.Response.builder()
                .id(complaint.getId())
                .complaintNumber(complaint.getComplaintNumber())
                .customerId(complaint.getCustomer() != null ? complaint.getCustomer().getId() : null)
                .customerName(complaint.getCustomer() != null ? complaint.getCustomer().getFullName() : null)
                .complaintType(complaint.getComplaintType())
                .description(complaint.getDescription())
                .evidence(complaint.getEvidence())
                .assignedStaffId(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getId() : null)
                .assignedStaffName(complaint.getAssignedStaff() != null ? complaint.getAssignedStaff().getFullName() : null)
                .resolution(complaint.getResolution())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .history(complaint.getHistory() != null ? complaint.getHistory().stream()
                        .map(ComplaintMapper::toHistoryResponseDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static ComplaintDto.HistoryResponse toHistoryResponseDto(ComplaintHistory history) {
        if (history == null) return null;
        return ComplaintDto.HistoryResponse.builder()
                .id(history.getId())
                .statusFrom(history.getStatusFrom())
                .statusTo(history.getStatusTo())
                .actionDetails(history.getActionDetails())
                .performedById(history.getPerformedBy() != null ? history.getPerformedBy().getId() : null)
                .performedByUsername(history.getPerformedBy() != null ? history.getPerformedBy().getUsername() : null)
                .createdAt(history.getCreatedAt())
                .build();
    }
}
