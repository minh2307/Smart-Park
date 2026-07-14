package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.AnalyticsDto.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsService {

    // Executive Dashboard
    DashboardSummaryDto getDashboardSummary();
    OverviewAnalyticsDto getOverview(int durationDays);
    KpiResponseDto getKpiMetrics(LocalDateTime from, LocalDateTime to);

    // Revenue Analytics
    List<RevenueTrendDto> getRevenueReport(LocalDateTime from, LocalDateTime to, String groupBy);
    List<RevenueTrendDto> getDailyRevenue(LocalDateTime from, LocalDateTime to);
    List<RevenueTrendDto> getMonthlyRevenue(int year);
    List<RevenueTrendDto> getYearlyRevenue();
    List<RevenueByTypeDto> getRevenueByTicket(LocalDateTime from, LocalDateTime to);
    List<RevenueByTypeDto> getRevenueByPayment(LocalDateTime from, LocalDateTime to);

    // Booking Analytics
    BookingSummaryDto getBookingSummary(LocalDateTime from, LocalDateTime to);
    List<BookingStatusDto> getBookingStatusBreakdown(LocalDateTime from, LocalDateTime to);
    List<BookingTrendDto> getBookingTrend(LocalDateTime from, LocalDateTime to, String groupBy);

    // Ticket Analytics
    TicketSummaryDto getTicketSummary(LocalDateTime from, LocalDateTime to);
    List<TicketSoldDto> getTicketSoldReport(LocalDateTime from, LocalDateTime to);
    List<TicketUsedDto> getTicketUsedReport(LocalDateTime from, LocalDateTime to);
    List<TicketCancelledDto> getTicketCancelledReport(LocalDateTime from, LocalDateTime to);

    // Ride Analytics
    RideSummaryDto getRideSummary(LocalDateTime from, LocalDateTime to);
    List<RidePopularityDto> getPopularRides(LocalDateTime from, LocalDateTime to, int limit, String direction);
    List<RideCapacityDto> getRideCapacityReport(Long rideId, LocalDate date);
    List<RideWaitingTimeDto> getRideWaitingTimeReport(Long rideId);

    // Customer Analytics
    CustomerSummaryDto getCustomerSummary(LocalDateTime from, LocalDateTime to);
    List<CustomerRegistrationDto> getNewCustomerRegistrationTrend(LocalDateTime from, LocalDateTime to, String groupBy);
    CustomerReturningDto getReturningCustomersReport(LocalDateTime from, LocalDateTime to);
    List<CustomerMembershipDto> getMembershipDistribution();

    // Parking Analytics
    ParkingSummaryDto getParkingSummary(LocalDateTime from, LocalDateTime to);
    List<ParkingOccupancyDto> getParkingOccupancyReport(Long lotId, LocalDateTime from, LocalDateTime to);
    List<ParkingRevenueDto> getParkingRevenueReport(LocalDateTime from, LocalDateTime to);

    // Retail Analytics
    RetailSummaryDto getRetailSummary(LocalDateTime from, LocalDateTime to);
    List<RetailSalesDto> getRetailSalesReport(LocalDateTime from, LocalDateTime to, String groupBy);
    List<RetailProductsDto> getPopularProductsReport(LocalDateTime from, LocalDateTime to, int limit);

    // Promotion Analytics
    PromotionSummaryDto getPromotionSummary(LocalDateTime from, LocalDateTime to);
    List<CouponPerformanceDto> getCouponUsagesReport(Long campaignId, LocalDateTime from, LocalDateTime to);
    VoucherSummaryDto getVoucherUsagesReport(LocalDateTime from, LocalDateTime to);
}
