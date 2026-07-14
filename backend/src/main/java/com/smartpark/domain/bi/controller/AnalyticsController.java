package com.smartpark.domain.bi.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.bi.dto.AnalyticsDto.*;
import com.smartpark.domain.bi.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PARK_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER', 'BUSINESS_ANALYST')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    private LocalDateTime getStartOfDayOrMinusDays(LocalDate date, int minusDays) {
        return date != null ? date.atStartOfDay() : LocalDate.now().minusDays(minusDays).atStartOfDay();
    }

    private LocalDateTime getEndOfDayOrNow(LocalDate date) {
        return date != null ? date.atTime(LocalTime.MAX) : LocalDate.now().atTime(LocalTime.MAX);
    }

    // ─────────────────── EXECUTIVE DASHBOARD ─────────────────────────

    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardSummary()));
    }

    @GetMapping("/dashboard/overview")
    public ResponseEntity<ApiResponse<OverviewAnalyticsDto>> getOverview(
            @RequestParam(defaultValue = "30") int durationDays) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverview(durationDays)));
    }

    @GetMapping("/dashboard/kpi")
    public ResponseEntity<ApiResponse<KpiResponseDto>> getKpiMetrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getKpiMetrics(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    // ─────────────────── REVENUE ANALYTICS ───────────────────────────

    @GetMapping("/revenue/report")
    public ResponseEntity<ApiResponse<List<RevenueTrendDto>>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "DAILY") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), groupBy)));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<ApiResponse<List<RevenueTrendDto>>> getDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyRevenue(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<List<RevenueTrendDto>>> getMonthlyRevenue(
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyRevenue(year)));
    }

    @GetMapping("/revenue/yearly")
    public ResponseEntity<ApiResponse<List<RevenueTrendDto>>> getYearlyRevenue() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getYearlyRevenue()));
    }

    @GetMapping("/revenue/by-ticket")
    public ResponseEntity<ApiResponse<List<RevenueByTypeDto>>> getRevenueByTicket(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueByTicket(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/revenue/by-payment")
    public ResponseEntity<ApiResponse<List<RevenueByTypeDto>>> getRevenueByPayment(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRevenueByPayment(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    // ─────────────────── BOOKING ANALYTICS ───────────────────────────

    @GetMapping("/bookings/summary")
    public ResponseEntity<ApiResponse<BookingSummaryDto>> getBookingSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getBookingSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/bookings/status")
    public ResponseEntity<ApiResponse<List<BookingStatusDto>>> getBookingStatusBreakdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getBookingStatusBreakdown(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/bookings/trend")
    public ResponseEntity<ApiResponse<List<BookingTrendDto>>> getBookingTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "DAILY") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getBookingTrend(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), groupBy)));
    }

    // ─────────────────── TICKET ANALYTICS ────────────────────────────

    @GetMapping("/tickets/summary")
    public ResponseEntity<ApiResponse<TicketSummaryDto>> getTicketSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/tickets/sold")
    public ResponseEntity<ApiResponse<List<TicketSoldDto>>> getTicketSoldReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketSoldReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/tickets/used")
    public ResponseEntity<ApiResponse<List<TicketUsedDto>>> getTicketUsedReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketUsedReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/tickets/cancelled")
    public ResponseEntity<ApiResponse<List<TicketCancelledDto>>> getTicketCancelledReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketCancelledReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    // ─────────────────── RIDE ANALYTICS ──────────────────────────────

    @GetMapping("/rides/summary")
    public ResponseEntity<ApiResponse<RideSummaryDto>> getRideSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRideSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/rides/popular")
    public ResponseEntity<ApiResponse<List<RidePopularityDto>>> getPopularRides(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "DESC") String direction) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPopularRides(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), limit, direction)));
    }

    @GetMapping("/rides/capacity")
    public ResponseEntity<ApiResponse<List<RideCapacityDto>>> getRideCapacityReport(
            @RequestParam(required = false) Long rideId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRideCapacityReport(rideId, targetDate)));
    }

    @GetMapping("/rides/waiting-time")
    public ResponseEntity<ApiResponse<List<RideWaitingTimeDto>>> getRideWaitingTimeReport(
            @RequestParam(required = false) Long rideId) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRideWaitingTimeReport(rideId)));
    }

    // ─────────────────── CUSTOMER ANALYTICS ──────────────────────────

    @GetMapping("/customers/summary")
    public ResponseEntity<ApiResponse<CustomerSummaryDto>> getCustomerSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCustomerSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/customers/registration-trend")
    public ResponseEntity<ApiResponse<List<CustomerRegistrationDto>>> getNewCustomerRegistrationTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "DAILY") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getNewCustomerRegistrationTrend(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), groupBy)));
    }

    @GetMapping("/customers/returning")
    public ResponseEntity<ApiResponse<CustomerReturningDto>> getReturningCustomersReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getReturningCustomersReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/customers/membership-distribution")
    public ResponseEntity<ApiResponse<List<CustomerMembershipDto>>> getMembershipDistribution() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMembershipDistribution()));
    }

    // ─────────────────── PARKING ANALYTICS ───────────────────────────

    @GetMapping("/parking/summary")
    public ResponseEntity<ApiResponse<ParkingSummaryDto>> getParkingSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getParkingSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/parking/occupancy")
    public ResponseEntity<ApiResponse<List<ParkingOccupancyDto>>> getParkingOccupancyReport(
            @RequestParam(required = false) Long lotId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getParkingOccupancyReport(
                lotId, getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/parking/revenue")
    public ResponseEntity<ApiResponse<List<ParkingRevenueDto>>> getParkingRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getParkingRevenueReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    // ─────────────────── RETAIL ANALYTICS ────────────────────────────

    @GetMapping("/retail/summary")
    public ResponseEntity<ApiResponse<RetailSummaryDto>> getRetailSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRetailSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/retail/sales")
    public ResponseEntity<ApiResponse<List<RetailSalesDto>>> getRetailSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "DAILY") String groupBy) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getRetailSalesReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), groupBy)));
    }

    @GetMapping("/retail/popular-products")
    public ResponseEntity<ApiResponse<List<RetailProductsDto>>> getPopularProductsReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPopularProductsReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to), limit)));
    }

    // ─────────────────── PROMOTION ANALYTICS ─────────────────────────

    @GetMapping("/promotions/summary")
    public ResponseEntity<ApiResponse<PromotionSummaryDto>> getPromotionSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getPromotionSummary(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/promotions/coupon-usages")
    public ResponseEntity<ApiResponse<List<CouponPerformanceDto>>> getCouponUsagesReport(
            @RequestParam(required = false) Long campaignId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCouponUsagesReport(
                campaignId, getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }

    @GetMapping("/promotions/vouchers")
    public ResponseEntity<ApiResponse<VoucherSummaryDto>> getVoucherUsagesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getVoucherUsagesReport(
                getStartOfDayOrMinusDays(from, 30), getEndOfDayOrNow(to))));
    }
}
