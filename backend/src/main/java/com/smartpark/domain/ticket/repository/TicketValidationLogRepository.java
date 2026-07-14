package com.smartpark.domain.ticket.repository;

import com.smartpark.domain.ticket.entity.TicketValidationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketValidationLogRepository extends JpaRepository<TicketValidationLog, Long> {

    @Query("SELECT t FROM TicketValidationLog t WHERE " +
           "(:search IS NULL OR LOWER(t.ticketCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.failureReason) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:gateId IS NULL OR t.gateId = :gateId)")
    Page<TicketValidationLog> findAllWithFilters(String search, String status, Long gateId, Pageable pageable);

    long countByStatus(String status);
}
