package com.smartpark.domain.feedback.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.feedback.dto.FeedbackDto;
import com.smartpark.domain.feedback.entity.Feedback.FeedbackCategory;
import com.smartpark.domain.feedback.entity.Feedback.FeedbackStatus;
import com.smartpark.domain.feedback.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Tag(name = "Customer Feedback", description = "API tiếp nhận đánh giá chất lượng dịch vụ của khách hàng")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER')")
    @Operation(summary = "Lấy danh sách đánh giá của khách hàng")
    public ResponseEntity<ApiResponse<Page<FeedbackDto.Response>>> findAllFeedbacks(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) FeedbackCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FeedbackStatus status,
            Pageable pageable
    ) {
        Page<FeedbackDto.Response> result = feedbackService.findAllFeedbacksWithFilters(rating, category, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE', 'SUPERVISOR', 'PARK_MANAGER', 'CUSTOMER')")
    @Operation(summary = "Lấy chi tiết phản hồi")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> findFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.findFeedbackById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Khách hàng gửi ý kiến phản hồi mới")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> createFeedback(
            @Valid @RequestBody FeedbackDto.CreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.createFeedback(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER_SERVICE')")
    @Operation(summary = "Cập nhật thông tin/trạng thái phản hồi")
    public ResponseEntity<ApiResponse<FeedbackDto.Response>> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackDto.UpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.updateFeedback(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa ý kiến phản hồi")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phản hồi thành công.", null));
    }
}
