package com.smartpark.domain.ticket.repository;

import com.smartpark.domain.ticket.entity.Ticket;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);

    /** Pessimistic lock để tránh double check-in (BR-TKT-02) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Ticket t WHERE t.ticketCode = :code")
    Optional<Ticket> findByTicketCodeForUpdate(String code);

    Page<Ticket> findByCustomerId(Long customerId, Pageable pageable);
    List<Ticket> findByCustomerIdAndStatus(Long customerId, Ticket.TicketStatus status);
    List<Ticket> findByStatusAndValidDateBefore(Ticket.TicketStatus status, LocalDate date);
    List<Ticket> findByBookingId(Long bookingId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status IN (com.smartpark.domain.ticket.entity.Ticket.TicketStatus.PAID, com.smartpark.domain.ticket.entity.Ticket.TicketStatus.CHECKED_IN, com.smartpark.domain.ticket.entity.Ticket.TicketStatus.USED) AND t.createdAt BETWEEN :from AND :to")
    long countTicketsSoldBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
