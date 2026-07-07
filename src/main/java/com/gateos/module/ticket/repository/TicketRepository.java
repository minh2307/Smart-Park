package com.gateos.module.ticket.repository;

import com.gateos.module.ticket.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCustomerId(Long customerId, Pageable pageable);
    Optional<Ticket> findByTicketCode(String ticketCode);
    long countByCustomerIdAndStatus(Long customerId, Ticket.TicketStatus status);
}
