package com.smartpark.domain.ride.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.entity.RideMaintenance;
import com.smartpark.domain.ride.entity.RideSchedule;
import com.smartpark.domain.ride.service.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Ride>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(rideService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ride>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(rideService.findById(id)));
    }

    @PostMapping("/zones/{zoneId}")
    public ResponseEntity<ApiResponse<Ride>> create(@PathVariable Long zoneId, @RequestBody Ride ride) {
        return ResponseEntity.ok(ApiResponse.success(rideService.create(zoneId, ride)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Ride>> updateStatus(@PathVariable Long id,
                                                          @RequestParam Ride.RideStatus status) {
        return ResponseEntity.ok(ApiResponse.success(rideService.updateStatus(id, status)));
    }

    @PostMapping("/{rideId}/schedules")
    public ResponseEntity<ApiResponse<RideSchedule>> createSchedule(@PathVariable Long rideId,
                                                                     @RequestBody RideSchedule schedule) {
        return ResponseEntity.ok(ApiResponse.success(rideService.createSchedule(rideId, schedule)));
    }

    @GetMapping("/{id}/queue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getQueueInfo(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getQueueInfo(id)));
    }

    @PostMapping("/{id}/maintenance")
    public ResponseEntity<ApiResponse<RideMaintenance>> scheduleMaintenance(
            @PathVariable Long id,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam String reason) {
        return ResponseEntity.ok(ApiResponse.success(rideService.scheduleMaintenance(id, startTime, endTime, reason)));
    }

    @PostMapping("/{id}/usage")
    public ResponseEntity<ApiResponse<Void>> recordRideUsage(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam(required = false) Integer duration,
            @RequestParam(required = false) String zone) {
        rideService.recordRideUsage(id, userId, duration, zone);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
