package com.smartpark.domain.ticket.service;

import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TicketTypeService {
    TicketTypeResponseDto createTicketType(TicketTypeRequestDto request);
    TicketTypeResponseDto updateTicketType(Long id, TicketTypeRequestDto request);
    void deleteTicketType(Long id);
    TicketTypeResponseDto getTicketTypeById(Long id);
    Page<TicketTypeResponseDto> getAllTicketTypes(String search, String status, Pageable pageable);
    List<TicketTypeResponseDto> getTicketTypesByVenue(Long venueId);
}
