package com.smartpark.domain.bi.controller;

import com.smartpark.domain.bi.entity.AnalyticsDeadLetter;
import com.smartpark.domain.bi.service.DlqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dlq")
@RequiredArgsConstructor
public class AdminDlqController {

    private final DlqService dlqService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AnalyticsDeadLetter>> getAllDlqEvents() {
        return ResponseEntity.ok(dlqService.getAllDlqEvents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<AnalyticsDeadLetter> getDlqEvent(@PathVariable Long id) {
        AnalyticsDeadLetter event = dlqService.getDlqEvent(id);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(event);
    }

    @PostMapping("/{id}/requeue")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> requeueEvent(@PathVariable Long id) {
        boolean success = dlqService.requeueEvent(id);
        if (!success) {
            return ResponseEntity.badRequest().build(); // E.g., not found or serialization issue
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDlqEvent(@PathVariable Long id) {
        boolean success = dlqService.deleteDlqEvent(id);
        if (!success) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}
