package com.smartpark.domain.support.service;

import com.smartpark.domain.support.dto.SupportTicketDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface SupportTicketService {
    Page<SupportTicketDto.Response> findAllTickets(
            String search,
            String status,
            String priority,
            Long customerId,
            Long employeeId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    SupportTicketDto.Response findTicketById(Long id);

    SupportTicketDto.Response createTicket(SupportTicketDto.CreateRequest request);

    SupportTicketDto.Response updateTicket(Long id, SupportTicketDto.UpdateRequest request);

    SupportTicketDto.Response assignTicket(Long id, SupportTicketDto.AssignRequest request);

    SupportTicketDto.Response updateTicketStatus(Long id, String status);

    SupportTicketDto.Response closeTicket(Long id, SupportTicketDto.CloseRequest request);

    SupportTicketDto.CommentResponse addComment(Long ticketId, SupportTicketDto.CommentRequest request);
}
