package com.smartpark.domain.feedback.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.feedback.entity.Feedback;
import com.smartpark.domain.feedback.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Feedback>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.findAll(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Feedback>> create(@RequestBody Feedback feedback) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.create(feedback)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Feedback>> updateStatus(@PathVariable Long id, @RequestParam Feedback.FeedbackStatus status) {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.updateStatus(id, status)));
    }
}
