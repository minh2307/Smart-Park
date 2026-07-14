package com.smartpark.domain.feedback.mapper;

import com.smartpark.domain.feedback.dto.FeedbackDto;
import com.smartpark.domain.feedback.entity.Feedback;

public class FeedbackMapper {

    public static FeedbackDto.Response toResponseDto(Feedback feedback) {
        if (feedback == null) return null;
        return FeedbackDto.Response.builder()
                .id(feedback.getId())
                .customerId(feedback.getCustomer() != null ? feedback.getCustomer().getId() : null)
                .customerName(feedback.getCustomer() != null ? feedback.getCustomer().getFullName() : null)
                .category(feedback.getCategory())
                .content(feedback.getContent())
                .rating(feedback.getRating())
                .assignedEmployeeId(feedback.getAssignedEmployeeId())
                .status(feedback.getStatus())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
