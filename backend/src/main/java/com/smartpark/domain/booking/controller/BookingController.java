package com.smartpark.domain.booking.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.booking.dto.BookingRequest;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(
            @RequestBody BookingRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.createBooking(request, idempotencyKey)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Booking>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.findAll(pageable)));
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<ApiResponse<Page<Booking>>> findByCustomer(
            @PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.findByCustomer(customerId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.findById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Booking>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.findByCode(code)));
    }

    @PostMapping("/{code}/confirm")
    public ResponseEntity<ApiResponse<Booking>> confirmPayment(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.confirmPayment(code)));
    }

    @PutMapping("/{code}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @PathVariable String code,
            @RequestParam(defaultValue = "User requested cancellation") String reason) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancel(code, reason)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(@PathVariable Long id, @RequestParam Booking.BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.updateStatus(id, status)));
    }
}
