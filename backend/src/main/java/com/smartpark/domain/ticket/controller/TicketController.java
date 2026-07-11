package com.smartpark.domain.ticket.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ticket.entity.CheckIn;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<Ticket>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.findById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Ticket>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.findByCode(code)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<Page<Ticket>>> findByCustomer(
            @PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.findByCustomer(customerId, pageable)));
    }

    @PostMapping("/reserve")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Ticket>>> reserveTickets(
            @RequestParam Long customerId,
            @RequestParam Long ticketTypeId,
            @RequestParam int quantity,
            @RequestParam(required = false) LocalDate validDate) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.reserveTickets(customerId, ticketTypeId, quantity, validDate)));
    }

    @PostMapping("/confirm")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Ticket>>> confirmTickets(@RequestBody List<Long> ticketIds) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.confirmTickets(ticketIds)));
    }

    @PostMapping("/release")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> releaseTickets(@RequestBody List<Long> ticketIds) {
        ticketService.releaseTickets(ticketIds);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/check-in/{code}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<CheckIn>> checkIn(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.checkIn(code)));
    }
}
