package com.gateos.module.tickettype.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.tickettype.dto.TicketTypeRequest;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import com.gateos.module.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketTypeService {

    private final TicketTypeRepository ticketTypeRepository;
    private final VenueRepository venueRepository;

    public Page<TicketType> getAll(Long venueId, String status, Pageable pageable) {
        if (venueId != null) return ticketTypeRepository.findByVenueId(venueId, pageable);
        if (status != null) {
            try {
                return ticketTypeRepository.findByStatus(TicketType.TicketTypeStatus.valueOf(status.toUpperCase()), pageable);
            } catch (IllegalArgumentException ignored) {}
        }
        return ticketTypeRepository.findAll(pageable);
    }

    public TicketType getById(Long id) {
        return ticketTypeRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Loại vé không tồn tại", "ERR-TKT-003"));
    }

    @Transactional
    public TicketType create(TicketTypeRequest request) {
        if (!venueRepository.existsById(request.getVenueId())) {
            throw BusinessException.notFound("Địa điểm không tồn tại", "ERR-VEN-003");
        }
        TicketType ticketType = TicketType.builder()
                .venueId(request.getVenueId())
                .name(request.getName())
                .type(request.getType())
                .price(request.getPrice())
                .status(request.getStatus() != null ? request.getStatus() : TicketType.TicketTypeStatus.ACTIVE)
                .policy(request.getPolicy())
                .validDays(request.getValidDays() != null ? request.getValidDays() : 1)
                .build();
        return ticketTypeRepository.save(ticketType);
    }

    @Transactional
    public TicketType update(Long id, TicketTypeRequest request) {
        TicketType tt = getById(id);
        tt.setName(request.getName());
        tt.setType(request.getType());
        tt.setPrice(request.getPrice());
        tt.setPolicy(request.getPolicy());
        tt.setValidDays(request.getValidDays());
        if (request.getStatus() != null) tt.setStatus(request.getStatus());
        return ticketTypeRepository.save(tt);
    }

    @Transactional
    public void softDelete(Long id) {
        TicketType tt = getById(id);
        tt.setStatus(TicketType.TicketTypeStatus.INACTIVE);
        ticketTypeRepository.save(tt);
    }
}
