package com.smartpark.domain.bi.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.bi.dto.BiDto;
import com.smartpark.domain.bi.service.BiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * BI Dashboard API — protected, admin/analyst only.
 *
 * All endpoints query the analytics_events table (MySQL).
 * When BigQuery integration is active, these can be switched to BQ queries for scale.
 */
@RestController
@RequestMapping("/api/v1/bi")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST')")
public class BiController {

    private final BiService biService;

    // ─────────────────── DASHBOARD SUMMARY ───────────────────────────

    /**
     * Main dashboard card — revenue today, visitors today, pending bookings.
     * GET /api/v1/bi/dashboard/summary
     */
    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<BiDto.DashboardSummary>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(biService.getDashboardSummary()));
    }

    // ─────────────────── REVENUE METRICS ─────────────────────────────

    /**
     * Daily revenue.
     * GET /api/v1/bi/revenue/daily?date=2026-07-09
     */
    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<BiDto.RevenueResponse>> getDailyRevenue(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(biService.getDailyRevenue(date)));
    }

    /**
     * Monthly revenue.
     * GET /api/v1/bi/revenue/monthly?year=2026&month=7
     */
    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<BiDto.RevenueResponse>> getMonthlyRevenue(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        if (year == 0)  year  = LocalDate.now().getYear();
        if (month == 0) month = LocalDate.now().getMonthValue();
        return ResponseEntity.ok(ApiResponse.success(biService.getMonthlyRevenue(year, month)));
    }

    /**
     * Revenue breakdown by ticket type.
     * GET /api/v1/bi/revenue/by-ticket-type?from=2026-07-01&to=2026-07-09
     */
    @GetMapping("/revenue/by-ticket-type")
    public ResponseEntity<ApiResponse<List<BiDto.RevenueByTypeItem>>> getRevenueByTicketType(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to == null)   to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(biService.getRevenueByTicketType(from, to)));
    }

    // ─────────────────── VISITOR METRICS ─────────────────────────────

    /**
     * Daily visitor (check-in) count.
     * GET /api/v1/bi/visitors/daily?date=2026-07-09
     */
    @GetMapping("/visitors/daily")
    public ResponseEntity<ApiResponse<BiDto.VisitorResponse>> getDailyVisitors(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(biService.getDailyVisitors(date)));
    }

    // ─────────────────── OPERATIONS METRICS ──────────────────────────

    /**
     * Peak hours (visitor count by hour of day).
     * GET /api/v1/bi/operations/peak-hours?date=2026-07-09
     */
    @GetMapping("/operations/peak-hours")
    public ResponseEntity<ApiResponse<List<BiDto.PeakHourItem>>> getPeakHours(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(biService.getPeakHours(date)));
    }

    // ─────────────────── CUSTOMER ANALYTICS ──────────────────────────

    /**
     * Top spending customers (all time).
     * GET /api/v1/bi/customers/top-spenders?limit=10
     */
    @GetMapping("/customers/top-spenders")
    public ResponseEntity<ApiResponse<List<BiDto.TopSpenderItem>>> getTopSpenders(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(biService.getTopSpenders(limit)));
    }
}
