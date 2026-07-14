package com.smartpark.domain.visitor.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.visitor.entity.Visitor;
import com.smartpark.domain.visitor.repository.VisitorRepository;
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
public class VisitorService {

    private final VisitorRepository visitorRepository;

    @Transactional(readOnly = true)
    public Page<Visitor> findAll(String search, String relationship, String status, Pageable pageable) {
        List<Visitor> visitors = visitorRepository.findAll();

        // Filter based on search query, relationship, status
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            visitors = visitors.stream()
                    .filter(v -> v.getFullName().toLowerCase().contains(lowerSearch) ||
                                 v.getIdentificationNumber().toLowerCase().contains(lowerSearch) ||
                                 v.getNationality().toLowerCase().contains(lowerSearch))
                    .collect(Collectors.toList());
        }

        if (relationship != null && !relationship.trim().isEmpty()) {
            visitors = visitors.stream()
                    .filter(v -> v.getRelationship().equalsIgnoreCase(relationship))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.trim().isEmpty()) {
            visitors = visitors.stream()
                    .filter(v -> v.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Add dummy counts or calculate them from bookings/tickets if needed
        visitors.forEach(v -> {
            v.setBookingCount(v.getId().intValue() * 2); 
            v.setTicketCount(v.getId().intValue() * 3);
        });

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), visitors.size());

        if (start > visitors.size()) {
            return new PageImpl<>(List.of(), pageable, visitors.size());
        }

        return new PageImpl<>(visitors.subList(start, end), pageable, visitors.size());
    }

    @Transactional(readOnly = true)
    public Visitor findById(Long id) {
        Visitor visitor = visitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor", id));
        visitor.setBookingCount(visitor.getId().intValue() * 2);
        visitor.setTicketCount(visitor.getId().intValue() * 3);
        return visitor;
    }

    @Transactional(readOnly = true)
    public List<Visitor> findByCustomerId(Long customerId) {
        List<Visitor> visitors = visitorRepository.findByCustomerId(customerId);
        visitors.forEach(v -> {
            v.setBookingCount(v.getId().intValue() * 2);
            v.setTicketCount(v.getId().intValue() * 3);
        });
        return visitors;
    }

    @Transactional
    public Visitor create(Visitor visitor) {
        return visitorRepository.save(visitor);
    }

    @Transactional
    public Visitor update(Long id, Visitor details) {
        Visitor visitor = findById(id);
        visitor.setFullName(details.getFullName());
        visitor.setAge(details.getAge());
        visitor.setGender(details.getGender());
        visitor.setNationality(details.getNationality());
        visitor.setIdentificationNumber(details.getIdentificationNumber());
        visitor.setRelationship(details.getRelationship());
        visitor.setStatus(details.getStatus());
        visitor.setEmergencyContactName(details.getEmergencyContactName());
        visitor.setEmergencyContactPhone(details.getEmergencyContactPhone());
        visitor.setMedicalNotes(details.getMedicalNotes());
        return visitorRepository.save(visitor);
    }

    @Transactional
    public void delete(Long id) {
        Visitor visitor = findById(id);
        visitorRepository.delete(visitor);
    }
}
