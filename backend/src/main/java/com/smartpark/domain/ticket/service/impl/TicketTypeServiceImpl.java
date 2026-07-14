package com.smartpark.domain.ticket.service.impl;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.entity.TicketType.TicketTypeStatus;
import com.smartpark.domain.ticket.mapper.TicketTypeMapper;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import com.smartpark.domain.ticket.service.TicketTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketTypeServiceImpl implements TicketTypeService {

    private final TicketTypeRepository ticketTypeRepository;
    private final ParkRepository parkRepository;

    @Override
    @Transactional
    public TicketTypeResponseDto createTicketType(TicketTypeRequestDto request) {
        log.info("[TICKET TYPE CREATE] name={}, venueId={}", request.getName(), request.getVenueId());
        Park park = parkRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Park", request.getVenueId()));

        TicketType ticketType = TicketTypeMapper.toEntity(request, park);
        TicketType saved = ticketTypeRepository.save(ticketType);
        
        log.info("[TICKET TYPE CREATED] id={}", saved.getId());
        return TicketTypeMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public TicketTypeResponseDto updateTicketType(Long id, TicketTypeRequestDto request) {
        log.info("[TICKET TYPE UPDATE] id={}, name={}", id, request.getName());
        TicketType ticketType = ticketTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketType", id));

        Park park = parkRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Park", request.getVenueId()));

        TicketTypeMapper.updateEntity(ticketType, request, park);
        TicketType saved = ticketTypeRepository.save(ticketType);
        
        log.info("[TICKET TYPE UPDATED] id={}", saved.getId());
        return TicketTypeMapper.toResponseDto(saved);
    }

    @Override
    @Transactional
    public void deleteTicketType(Long id) {
        log.info("[TICKET TYPE DELETE] id={}", id);
        TicketType ticketType = ticketTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketType", id));
        
        // Soft delete/Inactive by default to preserve historical data
        ticketType.setStatus(TicketTypeStatus.INACTIVE);
        ticketTypeRepository.save(ticketType);
        log.info("[TICKET TYPE DELETED] status set to INACTIVE for id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketTypeResponseDto getTicketTypeById(Long id) {
        TicketType ticketType = ticketTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketType", id));
        return TicketTypeMapper.toResponseDto(ticketType);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketTypeResponseDto> getAllTicketTypes(String search, String status, Pageable pageable) {
        TicketTypeStatus typeStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                typeStatus = TicketTypeStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }

        String searchVal = (search == null || search.trim().isEmpty()) ? null : search;

        return ticketTypeRepository.findAllWithFilters(searchVal, typeStatus, pageable)
                .map(TicketTypeMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketTypeResponseDto> getTicketTypesByVenue(Long venueId) {
        return ticketTypeRepository.findByParkId(venueId).stream()
                .map(TicketTypeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
}
