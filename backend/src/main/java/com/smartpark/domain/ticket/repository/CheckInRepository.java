package com.smartpark.domain.ticket.repository;

import com.smartpark.domain.ticket.entity.CheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, Long> {
    List<CheckIn> findByTicketId(Long ticketId);
    boolean existsByTicketId(Long ticketId);

    @Query("SELECT COUNT(c) FROM CheckIn c WHERE c.checkInTime BETWEEN :from AND :to")
    long countByCheckInTimeBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT HOUR(check_time) as hourVal, COUNT(*) FROM check_ins WHERE check_time BETWEEN :from AND :to GROUP BY HOUR(check_time) ORDER BY hourVal ASC", nativeQuery = true)
    List<Object[]> countHourlyVisitorsBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
