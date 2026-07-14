package com.smartpark.domain.ride.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.entity.RideCategory;
import com.smartpark.domain.ride.repository.RideCategoryRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RideCategoryService {

    private final RideCategoryRepository rideCategoryRepository;
    private final RideRepository rideRepository;

    @Transactional(readOnly = true)
    public Page<RideCategory> findAll(String search, String status, Pageable pageable) {
        List<RideCategory> allCategories = rideCategoryRepository.findAll();
        
        // Populate transient fields
        allCategories.forEach(cat -> {
            long count = rideRepository.findAll().stream()
                    .filter(r -> r.getRideCategory() != null && r.getRideCategory().getId().equals(cat.getId()))
                    .count();
            cat.setRideCount((int) count);
        });

        // Filter based on search query if present
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            allCategories = allCategories.stream()
                    .filter(cat -> cat.getName().toLowerCase().contains(lowerSearch) || 
                                   (cat.getDescription() != null && cat.getDescription().toLowerCase().contains(lowerSearch)) ||
                                   (cat.getCode() != null && cat.getCode().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        // Handle simple in-memory pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), allCategories.size());
        
        if (start > allCategories.size()) {
            return new PageImpl<>(List.of(), pageable, allCategories.size());
        }
        
        List<RideCategory> subList = allCategories.subList(start, end);
        return new PageImpl<>(subList, pageable, allCategories.size());
    }

    @Transactional(readOnly = true)
    public RideCategory findById(Long id) {
        RideCategory cat = rideCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RideCategory", id));
        long count = rideRepository.findAll().stream()
                .filter(r -> r.getRideCategory() != null && r.getRideCategory().getId().equals(cat.getId()))
                .count();
        cat.setRideCount((int) count);
        return cat;
    }

    @Transactional
    public RideCategory create(RideCategory category) {
        return rideCategoryRepository.save(category);
    }

    @Transactional
    public RideCategory update(Long id, RideCategory details) {
        RideCategory cat = findById(id);
        cat.setName(details.getName());
        cat.setDescription(details.getDescription());
        return rideCategoryRepository.save(cat);
    }

    @Transactional
    public void delete(Long id) {
        RideCategory cat = findById(id);
        rideCategoryRepository.delete(cat);
    }
}
