package com.gateos.module.checkin.repository;

import com.gateos.module.checkin.entity.CheckIn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    Page<CheckIn> findByAttractionId(Long attractionId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.status = 'SUCCESS' " +
           "AND c.checkInTime >= :from AND c.checkInTime <= :to")
    long countSuccessBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.ticketId = :ticketId AND c.status = 'SUCCESS'")
    long countSuccessForTicket(@Param("ticketId") Long ticketId);
}
