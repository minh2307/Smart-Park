package com.smartpark.domain.complaint.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.complaint.dto.ComplaintDto;
import com.smartpark.domain.complaint.service.ComplaintService;
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
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "API tiếp nhận và giải quyết khiếu nại của khách hàng")
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER')")
    @Operation(summary = "Lấy danh sách khiếu nại với bộ lọc nâng cao")
    public ResponseEntity<ApiResponse<Page<ComplaintDto.Response>>> findAllComplaints(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable
    ) {
        Page<ComplaintDto.Response> result = complaintService.findAllComplaints(
                search, status, customerId, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER', 'CUSTOMER')")
    @Operation(summary = "Lấy chi tiết khiếu nại kèm lịch sử xử lý")
    public ResponseEntity<ApiResponse<ComplaintDto.Response>> findComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.findComplaintById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Khách hàng gửi khiếu nại mới")
    public ResponseEntity<ApiResponse<ComplaintDto.Response>> createComplaint(
            @Valid @RequestBody ComplaintDto.CreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.createComplaint(request)));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Giải quyết khiếu nại")
    public ResponseEntity<ApiResponse<ComplaintDto.Response>> resolveComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDto.ResolveRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.resolveComplaint(id, request)));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR')")
    @Operation(summary = "Từ chối giải quyết khiếu nại")
    public ResponseEntity<ApiResponse<ComplaintDto.Response>> rejectComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDto.RejectRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(complaintService.rejectComplaint(id, request)));
    }
}
