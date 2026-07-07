package com.gateos.module.tickettype.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.tickettype.dto.TicketTypeRequest;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.service.TicketTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Ticket Type Management", description = "Quản lý loại vé")
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;

    @GetMapping("/ticket-types")
    public ResponseEntity<ApiResponse<Page<TicketType>>> getAll(
            @RequestParam(required = false) Long venueId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(ticketTypeService.getAll(venueId, status, PageRequest.of(page, size))));
    }

    @GetMapping("/venues/{venueId}/ticket-types")
    public ResponseEntity<ApiResponse<Page<TicketType>>> getByVenue(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(ticketTypeService.getAll(venueId, null, PageRequest.of(page, size))));
    }

    @GetMapping("/ticket-types/{id}")
    public ResponseEntity<ApiResponse<TicketType>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ticketTypeService.getById(id)));
    }

    @PostMapping("/ticket-types")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TicketType>> create(@Valid @RequestBody TicketTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ticketTypeService.create(request), "Tạo loại vé thành công"));
    }

    @PutMapping("/ticket-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TicketType>> update(@PathVariable Long id, @Valid @RequestBody TicketTypeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(ticketTypeService.update(id, request), "Cập nhật loại vé thành công"));
    }

    @DeleteMapping("/ticket-types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        ticketTypeService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("Loại vé đã bị ngừng kinh doanh"));
    }
}
