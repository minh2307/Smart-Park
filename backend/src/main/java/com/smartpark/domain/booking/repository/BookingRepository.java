package com.smartpark.domain.booking.repository;

import com.smartpark.domain.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    Page<Booking> findByCustomerId(Long customerId, Pageable pageable);
    List<Booking> findByCustomerIdAndStatus(Long customerId, Booking.BookingStatus status);

    /** Lấy tất cả booking PENDING đã quá thời gian expiresAt (cho scheduler) */
    List<Booking> findByStatusAndExpiresAtBefore(Booking.BookingStatus status, LocalDateTime now);

    /** Đếm số booking PENDING của khách để chặn tạo quá nhiều */
    long countByCustomerIdAndStatus(Long customerId, Booking.BookingStatus status);

    /** Dashboard summary: count all bookings by status */
    long countByStatus(Booking.BookingStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :from AND :to")
    long countByCreatedAtBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.createdAt BETWEEN :from AND :to")
    long countByStatusAndCreatedAtBetween(@org.springframework.data.repository.query.Param("status") Booking.BookingStatus status, @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = :status AND b.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtBetween(@org.springframework.data.repository.query.Param("status") Booking.BookingStatus status, @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query("SELECT b.status, COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :from AND :to GROUP BY b.status")
    List<Object[]> countBookingsByStatusInRange(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(created_at) as period, COUNT(id) as countVal FROM bookings WHERE created_at BETWEEN :from AND :to GROUP BY DATE(created_at) ORDER BY period ASC", nativeQuery = true)
    List<Object[]> getBookingTrendDaily(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as period, COUNT(id) as countVal FROM bookings WHERE created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY period ASC", nativeQuery = true)
    List<Object[]> getBookingTrendMonthly(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE_FORMAT(created_at, '%Y') as period, COUNT(id) as countVal FROM bookings WHERE created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y') ORDER BY period ASC", nativeQuery = true)
    List<Object[]> getBookingTrendYearly(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

