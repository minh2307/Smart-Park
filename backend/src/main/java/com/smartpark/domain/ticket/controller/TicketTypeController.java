package com.smartpark.domain.ticket.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ticket.dto.TicketTypeRequestDto;
import com.smartpark.domain.ticket.dto.TicketTypeResponseDto;
import com.smartpark.domain.ticket.service.TicketTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ticket-types")
@RequiredArgsConstructor
@Tag(name = "Ticket Type Management", description = "Endpoints for creating, reading, updating, and deleting ticket types and configurations.")
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Ticket Type", description = "Admin only. Creates a new ticket type configuration for a specific park venue.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Ticket type created successfully."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request fields."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized access."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden. Admins only.")
    })
    public ResponseEntity<ApiResponse<TicketTypeResponseDto>> createTicketType(@Valid @RequestBody TicketTypeRequestDto request) {
        TicketTypeResponseDto response = ticketTypeService.createTicketType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Ticket Type", description = "Admin only. Updates an existing ticket type configuration by ID.")
    public ResponseEntity<ApiResponse<TicketTypeResponseDto>> updateTicketType(
            @PathVariable Long id,
            @Valid @RequestBody TicketTypeRequestDto request) {
        TicketTypeResponseDto response = ticketTypeService.updateTicketType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket type updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Ticket Type", description = "Admin only. Soft deletes/inactivates a ticket type configuration by ID.")
    public ResponseEntity<ApiResponse<Void>> deleteTicketType(@PathVariable Long id) {
        ticketTypeService.deleteTicketType(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket type deleted successfully", null));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @Operation(summary = "Get Ticket Type by ID", description = "Retrieves details of a single ticket type configuration.")
    public ResponseEntity<ApiResponse<TicketTypeResponseDto>> getTicketTypeById(@PathVariable Long id) {
        TicketTypeResponseDto response = ticketTypeService.getTicketTypeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'CUSTOMER')")
    @Operation(summary = "Get All Ticket Types", description = "Retrieves a paginated list of ticket types, filterable by search term and status.")
    public ResponseEntity<ApiResponse<Page<TicketTypeResponseDto>>> getAllTicketTypes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<TicketTypeResponseDto> response = ticketTypeService.getAllTicketTypes(search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
