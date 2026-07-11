package com.smartpark.domain.incident.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.incident.entity.Incident;
import com.smartpark.domain.incident.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Incident>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.findAll(pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Incident>> create(@RequestBody Incident incident) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.create(incident)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Incident>> updateStatus(@PathVariable Long id, @RequestParam Incident.IncidentStatus status) {
        return ResponseEntity.ok(ApiResponse.success(incidentService.updateStatus(id, status)));
    }
}
