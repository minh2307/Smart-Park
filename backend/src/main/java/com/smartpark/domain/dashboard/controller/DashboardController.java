package com.smartpark.domain.dashboard.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.dashboard.dto.DashboardSummaryDto;
import com.smartpark.domain.dashboard.dto.RevenueAnalyticsDto;
import com.smartpark.domain.dashboard.dto.VisitorFlowDto;
import com.smartpark.domain.dashboard.dto.OperationalDashboardDto;
import com.smartpark.domain.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller exposing REST endpoints for the Executive Dashboard.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EXECUTIVE', 'MANAGER')")
@Tag(name = "Executive Dashboard", description = "Endpoints for executive-level business intelligence, operational metrics, and analytics.")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get Dashboard Summary", description = "Retrieves 15 KPI cards including revenue, profit, tickets, rides, employee and incident metrics with 30-day growth and 7-day sparkline data.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard summary.",
                    content = @Content(schema = @Schema(implementation = DashboardSummaryDto.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request.", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden. Access is denied.", content = @Content)
    })
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardSummary()));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get Revenue Analytics", description = "Retrieves daily, weekly, or monthly aggregated revenue, cost, and profit data in the specified date range.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved revenue analytics.",
                    content = @Content(schema = @Schema(implementation = RevenueAnalyticsDto.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request.", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden. Access is denied.", content = @Content)
    })
    public ResponseEntity<ApiResponse<List<RevenueAnalyticsDto>>> getRevenueAnalytics(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "Start date for analytics (default: 30 days ago)", example = "2026-07-01") LocalDate startDate,
            
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            @Parameter(description = "End date for analytics (default: today)", example = "2026-07-30") LocalDate endDate,
            
            @RequestParam(required = false, defaultValue = "DAY")
            @Parameter(description = "Grouping level: DAY, WEEK, or MONTH", example = "DAY") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRevenueAnalytics(startDate, endDate, groupBy)));
    }

    @GetMapping("/visitors/flow")
    @Operation(summary = "Get Visitor Flow", description = "Retrieves today's visitor check-ins grouped hourly from 00:00 to 23:00.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved hourly visitor flow.",
                    content = @Content(schema = @Schema(implementation = VisitorFlowDto.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request.", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden. Access is denied.", content = @Content)
    })
    public ResponseEntity<ApiResponse<List<VisitorFlowDto>>> getVisitorFlow() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getVisitorFlow()));
    }

    @GetMapping("/operational")
    @Operation(summary = "Get Operational Dashboard Metrics", description = "Retrieves live operational metrics including gate status, ride status, parking summary, locker summary, scanner status, operator status, incidents, support tickets, maintenance items, and weather impact.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved operational dashboard data.",
                    content = @Content(schema = @Schema(implementation = OperationalDashboardDto.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized request.", content = @Content),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden. Access is denied.", content = @Content)
    })
    public ResponseEntity<ApiResponse<OperationalDashboardDto>> getOperationalDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOperationalDashboard()));
    }
 
    @GetMapping("/analytics/customer")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getCustomerAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getCustomerAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/booking")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getBookingAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getBookingAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/ticket")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getTicketAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTicketAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/ride")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getRideAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRideAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/parking")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getParkingAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getParkingAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/retail-food")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getRetailFoodAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getRetailFoodAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/membership")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getMembershipAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMembershipAnalytics(startDate, endDate)));
    }
 
    @GetMapping("/analytics/promotion")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getPromotionAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getPromotionAnalytics(startDate, endDate)));
    }
}
