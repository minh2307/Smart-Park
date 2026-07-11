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
}
