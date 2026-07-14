package com.smartpark.domain.support.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.support.dto.SupportTicketDto;
import com.smartpark.domain.support.service.SupportTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/support-tickets")
@RequiredArgsConstructor
@Tag(name = "Support Tickets", description = "API quản lý phiếu hỗ trợ kỹ thuật và CSKH")
public class SupportTicketController {

    private final SupportTicketService ticketService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER')")
    @Operation(summary = "Lấy danh sách phiếu hỗ trợ với bộ lọc nâng cao")
    public ResponseEntity<ApiResponse<Page<SupportTicketDto.Response>>> findAllTickets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable
    ) {
        Page<SupportTicketDto.Response> result = ticketService.findAllTickets(
                search, status, priority, customerId, employeeId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER', 'CUSTOMER')")
    @Operation(summary = "Lấy chi tiết phiếu hỗ trợ kèm bình luận")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> findTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.findTicketById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Khách hàng tạo mới phiếu hỗ trợ")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> createTicket(
            @Valid @RequestBody SupportTicketDto.CreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.createTicket(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    @Operation(summary = "Cập nhật tiêu đề, nội dung và độ ưu tiên của phiếu hỗ trợ")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.updateTicket(id, request)));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Phân công nhân viên xử lý phiếu hỗ trợ")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketDto.AssignRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.assignTicket(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Cập nhật trạng thái phiếu hỗ trợ")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.updateTicketStatus(id, status)));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Đóng phiếu hỗ trợ kèm giải pháp")
    public ResponseEntity<ApiResponse<SupportTicketDto.Response>> closeTicket(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketDto.CloseRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.closeTicket(id, request)));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'CUSTOMER')")
    @Operation(summary = "Thêm bình luận/phản hồi vào phiếu hỗ trợ")
    public ResponseEntity<ApiResponse<SupportTicketDto.CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketDto.CommentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.addComment(id, request)));
    }
}
