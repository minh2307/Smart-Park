package com.smartpark.domain.support.mapper;

import com.smartpark.domain.support.dto.SupportTicketDto;
import com.smartpark.domain.support.entity.SupportComment;
import com.smartpark.domain.support.entity.SupportTicket;

import java.util.stream.Collectors;

public class SupportTicketMapper {

    public static SupportTicketDto.Response toResponseDto(SupportTicket ticket) {
        if (ticket == null) return null;
        return SupportTicketDto.Response.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .customerId(ticket.getCustomer() != null ? ticket.getCustomer().getId() : null)
                .customerName(ticket.getCustomer() != null ? ticket.getCustomer().getFullName() : null)
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .assignedEmployeeId(ticket.getAssignedEmployee() != null ? ticket.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(ticket.getAssignedEmployee() != null ? ticket.getAssignedEmployee().getFullName() : null)
                .status(ticket.getStatus())
                .resolution(ticket.getResolution())
                .closedDate(ticket.getClosedDate())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .createdBy(ticket.getCreatedBy())
                .updatedBy(ticket.getUpdatedBy())
                .comments(ticket.getComments() != null ? ticket.getComments().stream()
                        .map(SupportTicketMapper::toCommentResponseDto)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static SupportTicketDto.CommentResponse toCommentResponseDto(SupportComment comment) {
        if (comment == null) return null;
        return SupportTicketDto.CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .username(comment.getUser() != null ? comment.getUser().getUsername() : null)
                .comment(comment.getComment())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
