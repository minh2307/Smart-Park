package com.smartpark.domain.park.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.service.ParkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parks")
@RequiredArgsConstructor
public class ParkController {

    private final ParkService parkService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Park>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(parkService.findAllParks(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Park>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(parkService.findParkById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Park>> create(@RequestBody Park park) {
        return ResponseEntity.ok(ApiResponse.success(parkService.createPark(park)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Park>> update(@PathVariable Long id, @RequestBody Park park) {
        return ResponseEntity.ok(ApiResponse.success(parkService.updatePark(id, park)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        parkService.softDeletePark(id);
        return ResponseEntity.ok(ApiResponse.success("Công viên đã bị vô hiệu hóa."));
    }

    @GetMapping("/{parkId}/zones")
    public ResponseEntity<ApiResponse<List<Zone>>> getZones(@PathVariable Long parkId) {
        return ResponseEntity.ok(ApiResponse.success(parkService.findZonesByPark(parkId)));
    }

    @PostMapping("/{parkId}/zones")
    public ResponseEntity<ApiResponse<Zone>> createZone(@PathVariable Long parkId, @RequestBody Zone zone) {
        return ResponseEntity.ok(ApiResponse.success(parkService.createZone(parkId, zone)));
    }
}
