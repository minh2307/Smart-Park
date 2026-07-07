package com.gateos.module.ticket.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "E-Ticket", description = "Quản lý vé điện tử QR")
public class TicketController {

    private final TicketService ticketService;

    @Operation(summary = "Lấy danh sách vé của khách hàng hiện tại")
    @GetMapping("/customers/me/tickets")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Page<Ticket>>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // In production, extract customerId from SecurityContext UserDetails
        return ResponseEntity.ok(ApiResponse.ok(ticketService.getMyTickets(1L, PageRequest.of(page, size))));
    }

    @Operation(summary = "Lấy chi tiết vé")
    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<Ticket>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ticketService.getById(id)));
    }

    @Operation(summary = "Lấy ảnh QR Code của vé (PNG byte stream)")
    @GetMapping(value = "/tickets/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQRCode(@PathVariable Long id) {
        byte[] qrImage = ticketService.getQRCodeImage(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }
}
