package com.gateos.module.tickettype.repository;

import com.gateos.module.tickettype.entity.TicketType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Long> {
    Page<TicketType> findByVenueId(Long venueId, Pageable pageable);
    List<TicketType> findByVenueIdAndStatus(Long venueId, TicketType.TicketTypeStatus status);
    Page<TicketType> findByStatus(TicketType.TicketTypeStatus status, Pageable pageable);
}
