package com.smartpark.domain.park.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.service.ParkService;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
public class VenueController {

    private final ParkService parkService;
    private final ZoneRepository zoneRepository;
    private final RideRepository rideRepository;
    private final TicketTypeRepository ticketTypeRepository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VenueDto {
        private Long id;
        private String name;
        private String code;
        private String address;
        private String description;
        private Integer maxCapacity;
        private Integer status; // 1 for ACTIVE, 0 for CLOSED/MAINTENANCE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttractionDto {
        private Long id;
        private Long venueId;
        private String name;
        private String code;
        private String description;
        private Integer capacity;
        private Double minHeight;
        private Double maxHeight;
        private Integer durationSeconds;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketTypeDto {
        private Long id;
        private Long venueId;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer totalQuantity;
        private Integer availableQuantity;
        private String type;
        private String status;
    }

    private VenueDto mapToVenueDto(Park park) {
        int statusInt = (park.getStatus() == Park.ParkStatus.ACTIVE) ? 1 : 0;
        return new VenueDto(
                park.getId(),
                park.getName(),
                park.getCode(),
                park.getAddress(),
                park.getDescription(),
                park.getMaxCapacity(),
                statusInt
        );
    }

    private AttractionDto mapToAttractionDto(Ride ride, Long venueId) {
        return new AttractionDto(
                ride.getId(),
                venueId,
                ride.getName(),
                ride.getCode(),
                ride.getDescription(),
                ride.getCapacity(),
                ride.getMinHeight(),
                ride.getMaxHeight(),
                ride.getDurationSeconds(),
                ride.getStatus().name()
        );
    }

    private TicketTypeDto mapToTicketTypeDto(TicketType type) {
        return new TicketTypeDto(
                type.getId(),
                type.getPark().getId(),
                type.getName(),
                type.getDescription(),
                type.getStandardPrice(),
                type.getTotalQuantity(),
                type.getAvailableQuantity(),
                type.getType().name(),
                type.getStatus().name()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VenueDto>>> findAll(Pageable pageable) {
        Page<Park> parks = parkService.findAllParks(pageable);
        List<VenueDto> list = parks.getContent().stream()
                .map(this::mapToVenueDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(new PageImpl<>(list, pageable, parks.getTotalElements())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VenueDto>> findById(@PathVariable Long id) {
        Park park = parkService.findParkById(id);
        return ResponseEntity.ok(ApiResponse.success(mapToVenueDto(park)));
    }

    @GetMapping("/{id}/attractions")
    public ResponseEntity<ApiResponse<List<AttractionDto>>> findAttractions(@PathVariable Long id) {
        List<Zone> zones = zoneRepository.findByParkId(id);
        List<AttractionDto> attractions = new ArrayList<>();
        for (Zone zone : zones) {
            List<Ride> rides = rideRepository.findByZoneId(zone.getId());
            for (Ride ride : rides) {
                attractions.add(mapToAttractionDto(ride, id));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(attractions));
    }

    @GetMapping("/{id}/ticket-types")
    public ResponseEntity<ApiResponse<List<TicketTypeDto>>> findTicketTypes(@PathVariable Long id) {
        List<TicketType> types = ticketTypeRepository.findByParkId(id);
        List<TicketTypeDto> dtos = types.stream()
                .map(this::mapToTicketTypeDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }
}
