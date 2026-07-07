package com.gateos.module.attraction.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.attraction.dto.AttractionRequest;
import com.gateos.module.attraction.entity.Attraction;
import com.gateos.module.attraction.repository.AttractionRepository;
import com.gateos.module.venue.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttractionService {

    private final AttractionRepository attractionRepository;
    private final VenueRepository venueRepository;

    public Page<Attraction> getByVenue(Long venueId, Pageable pageable) {
        if (!venueRepository.existsById(venueId)) {
            throw BusinessException.notFound("Địa điểm không tồn tại", "ERR-VEN-003");
        }
        return attractionRepository.findByVenueId(venueId, pageable);
    }

    public Attraction getById(Long id) {
        return attractionRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Trò chơi không tồn tại", "ERR-ATT-003"));
    }

    @Transactional
    public Attraction create(AttractionRequest request) {
        if (!venueRepository.existsById(request.getVenueId())) {
            throw BusinessException.notFound("Địa điểm không tồn tại", "ERR-VEN-003");
        }
        if (attractionRepository.existsByNameAndVenueId(request.getName(), request.getVenueId())) {
            throw BusinessException.conflict("Trò chơi này đã tồn tại trong địa điểm được chọn", "ERR-ATT-002");
        }
        Attraction attraction = Attraction.builder()
                .venueId(request.getVenueId())
                .name(request.getName())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Attraction.AttractionStatus.ACTIVE)
                .build();
        return attractionRepository.save(attraction);
    }

    @Transactional
    public Attraction update(Long id, AttractionRequest request) {
        Attraction attraction = getById(id);
        if (attractionRepository.existsByNameAndVenueIdAndIdNot(request.getName(), attraction.getVenueId(), id)) {
            throw BusinessException.conflict("Trò chơi này đã tồn tại trong địa điểm được chọn", "ERR-ATT-002");
        }
        attraction.setName(request.getName());
        attraction.setCapacity(request.getCapacity());
        attraction.setDescription(request.getDescription());
        if (request.getStatus() != null) attraction.setStatus(request.getStatus());
        return attractionRepository.save(attraction);
    }

    @Transactional
    public void softDelete(Long id) {
        Attraction attraction = getById(id);
        attraction.setStatus(Attraction.AttractionStatus.INACTIVE);
        attractionRepository.save(attraction);
    }
}
