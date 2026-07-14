package com.smartpark.domain.visitor.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.visitor.entity.Visitor;
import com.smartpark.domain.visitor.service.VisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class VisitorController {

    private final VisitorService visitorService;

    @GetMapping("/visitors")
    public ResponseEntity<ApiResponse<Page<Visitor>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String relationship,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.findAll(search, relationship, status, pageable)));
    }

    @GetMapping("/visitors/{id}")
    public ResponseEntity<ApiResponse<Visitor>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.findById(id)));
    }

    @GetMapping("/customers/{customerId}/visitors")
    public ResponseEntity<ApiResponse<List<Visitor>>> findByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.findByCustomerId(customerId)));
    }

    @PostMapping("/visitors")
    public ResponseEntity<ApiResponse<Visitor>> create(@RequestBody Visitor visitor) {
        return ResponseEntity.ok(ApiResponse.success(visitor.getCustomerId() == null ? 
                visitorService.create(Visitor.builder()
                        .customerId(1L) // Default fallback to first customer
                        .fullName(visitor.getFullName())
                        .age(visitor.getAge())
                        .gender(visitor.getGender())
                        .nationality(visitor.getNationality())
                        .identificationNumber(visitor.getIdentificationNumber())
                        .relationship(visitor.getRelationship())
                        .status(visitor.getStatus())
                        .emergencyContactName(visitor.getEmergencyContactName())
                        .emergencyContactPhone(visitor.getEmergencyContactPhone())
                        .medicalNotes(visitor.getMedicalNotes())
                        .build()) : 
                visitorService.create(visitor)));
    }

    @PutMapping("/visitors/{id}")
    public ResponseEntity<ApiResponse<Visitor>> update(@PathVariable Long id, @RequestBody Visitor visitor) {
        return ResponseEntity.ok(ApiResponse.success(visitorService.update(id, visitor)));
    }

    @DeleteMapping("/visitors/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        visitorService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Mock endpoint for booking assignment to avoid 404 in frontend operations
    @PostMapping("/bookings/{bookingId}/assign-visitors")
    public ResponseEntity<ApiResponse<Void>> assignVisitors(
            @PathVariable Long bookingId,
            @RequestBody Map<String, List<Long>> payload) {
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
