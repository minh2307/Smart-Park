package com.gateos.module.venue.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.venue.dto.VenueRequest;
import com.gateos.module.venue.entity.Venue;
import com.gateos.module.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    public Page<Venue> getAll(String search, String status, Pageable pageable) {
        Venue.VenueStatus venueStatus = null;
        if (status != null && !status.isBlank()) {
            try { venueStatus = Venue.VenueStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        return venueRepository.findAllWithFilter(search, venueStatus, pageable);
    }

    public Venue getById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Địa điểm không tồn tại", "ERR-VEN-003"));
    }

    @Transactional
    public Venue create(VenueRequest request) {
        if (venueRepository.existsByName(request.getName())) {
            throw BusinessException.conflict("Tên địa điểm đã được sử dụng", "ERR-VEN-001");
        }
        Venue venue = Venue.builder()
                .name(request.getName())
                .address(request.getAddress())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Venue.VenueStatus.ACTIVE)
                .build();
        return venueRepository.save(venue);
    }

    @Transactional
    public Venue update(Long id, VenueRequest request) {
        Venue venue = getById(id);
        if (venueRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw BusinessException.conflict("Tên địa điểm đã được sử dụng", "ERR-VEN-001");
        }
        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setDescription(request.getDescription());
        if (request.getStatus() != null) venue.setStatus(request.getStatus());
        return venueRepository.save(venue);
    }

    @Transactional
    public void softDelete(Long id) {
        Venue venue = getById(id);
        venue.setStatus(Venue.VenueStatus.INACTIVE);
        venueRepository.save(venue);
    }
}
