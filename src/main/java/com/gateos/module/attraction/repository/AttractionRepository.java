package com.gateos.module.attraction.repository;

import com.gateos.module.attraction.entity.Attraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Long> {
    Page<Attraction> findByVenueId(Long venueId, Pageable pageable);
    List<Attraction> findByVenueIdAndStatus(Long venueId, Attraction.AttractionStatus status);
    boolean existsByNameAndVenueId(String name, Long venueId);
    boolean existsByNameAndVenueIdAndIdNot(String name, Long venueId, Long id);
}
