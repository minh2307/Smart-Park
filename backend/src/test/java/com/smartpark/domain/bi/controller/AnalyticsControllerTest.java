package com.smartpark.domain.bi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.dto.AnalyticsDto.*;
import com.smartpark.domain.bi.service.AnalyticsService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnalyticsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnalyticsService analyticsService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetDashboardSummary() throws Exception {
        DashboardSummaryDto summary = DashboardSummaryDto.builder()
                .totalRevenue(BigDecimal.valueOf(1000000))
                .todayRevenue(BigDecimal.valueOf(50000))
                .activeVisitors(1500)
                .currentParkingOccupied(250)
                .currentParkingAvailable(150)
                .averageRideUtilization(0.75)
                .ticketsSoldToday(800)
                .membershipGrowthToday(45)
                .build();

        when(analyticsService.getDashboardSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRevenue").value(1000000))
                .andExpect(jsonPath("$.data.activeVisitors").value(1500));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetOverview() throws Exception {
        OverviewAnalyticsDto overview = OverviewAnalyticsDto.builder()
                .trends(Collections.singletonList(
                        OverviewTrendItem.builder().date("2026-07-10").revenue(BigDecimal.valueOf(25000)).visitors(120L).build()
                ))
                .build();

        when(analyticsService.getOverview(30)).thenReturn(overview);

        mockMvc.perform(get("/api/v1/analytics/dashboard/overview?durationDays=30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.trends[0].visitors").value(120));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetKpiMetrics() throws Exception {
        KpiResponseDto kpi = KpiResponseDto.builder()
                .averageOrderValue(BigDecimal.valueOf(150.50))
                .conversionRate(0.88)
                .totalActiveMembers(1200L)
                .memberChurnRate(0.02)
                .revenuePerVisitor(BigDecimal.valueOf(45.00))
                .build();

        when(analyticsService.getKpiMetrics(any(), any())).thenReturn(kpi);

        mockMvc.perform(get("/api/v1/analytics/dashboard/kpi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.conversionRate").value(0.88));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRevenueReport() throws Exception {
        RevenueTrendDto trend = RevenueTrendDto.builder().period("2026-07").totalRevenue(BigDecimal.valueOf(300000)).transactionCount(2000L).build();
        when(analyticsService.getRevenueReport(any(), any(), eq("MONTHLY"))).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/revenue/report?groupBy=MONTHLY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].period").value("2026-07"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetDailyRevenue() throws Exception {
        RevenueTrendDto trend = RevenueTrendDto.builder().period("2026-07-10").totalRevenue(BigDecimal.valueOf(15000)).transactionCount(120L).build();
        when(analyticsService.getDailyRevenue(any(), any())).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/revenue/daily"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].period").value("2026-07-10"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetMonthlyRevenue() throws Exception {
        RevenueTrendDto trend = RevenueTrendDto.builder().period("2026-07").totalRevenue(BigDecimal.valueOf(50000)).transactionCount(400L).build();
        when(analyticsService.getMonthlyRevenue(2026)).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/revenue/monthly?year=2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].period").value("2026-07"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetYearlyRevenue() throws Exception {
        RevenueTrendDto trend = RevenueTrendDto.builder().period("2026").totalRevenue(BigDecimal.valueOf(600000)).transactionCount(5000L).build();
        when(analyticsService.getYearlyRevenue()).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/revenue/yearly"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].period").value("2026"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRevenueByTicket() throws Exception {
        RevenueByTypeDto item = RevenueByTypeDto.builder().ticketCategory("ADULT").revenue(BigDecimal.valueOf(120000)).build();
        when(analyticsService.getRevenueByTicket(any(), any())).thenReturn(Collections.singletonList(item));

        mockMvc.perform(get("/api/v1/analytics/revenue/by-ticket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ticketCategory").value("ADULT"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRevenueByPayment() throws Exception {
        RevenueByTypeDto item = RevenueByTypeDto.builder().ticketCategory("VNPAY").revenue(BigDecimal.valueOf(320000)).build();
        when(analyticsService.getRevenueByPayment(any(), any())).thenReturn(Collections.singletonList(item));

        mockMvc.perform(get("/api/v1/analytics/revenue/by-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ticketCategory").value("VNPAY"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetBookingSummary() throws Exception {
        BookingSummaryDto summary = BookingSummaryDto.builder()
                .totalBookings(1500L)
                .completedBookings(1350L)
                .totalAmount(BigDecimal.valueOf(250000))
                .paymentSuccessRate(0.9)
                .build();
        when(analyticsService.getBookingSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/bookings/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBookings").value(1500));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetBookingStatusBreakdown() throws Exception {
        BookingStatusDto status = BookingStatusDto.builder().status("PAID").count(850L).build();
        when(analyticsService.getBookingStatusBreakdown(any(), any())).thenReturn(Collections.singletonList(status));

        mockMvc.perform(get("/api/v1/analytics/bookings/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("PAID"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetBookingTrend() throws Exception {
        BookingTrendDto trend = BookingTrendDto.builder().period("2026-07-10").bookingCount(45L).build();
        when(analyticsService.getBookingTrend(any(), any(), eq("DAILY"))).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/bookings/trend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].bookingCount").value(45));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetTicketSummary() throws Exception {
        TicketSummaryDto summary = TicketSummaryDto.builder().totalTicketsSold(2500L).totalTicketsUsed(2200L).checkInRate(0.88).build();
        when(analyticsService.getTicketSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/tickets/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTicketsSold").value(2500));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetTicketSoldReport() throws Exception {
        TicketSoldDto sold = TicketSoldDto.builder().ticketTypeName("Standard VIP").soldCount(450L).build();
        when(analyticsService.getTicketSoldReport(any(), any())).thenReturn(Collections.singletonList(sold));

        mockMvc.perform(get("/api/v1/analytics/tickets/sold"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ticketTypeName").value("Standard VIP"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetTicketUsedReport() throws Exception {
        TicketUsedDto used = TicketUsedDto.builder().ticketTypeName("Standard VIP").usedCount(400L).build();
        when(analyticsService.getTicketUsedReport(any(), any())).thenReturn(Collections.singletonList(used));

        mockMvc.perform(get("/api/v1/analytics/tickets/used"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ticketTypeName").value("Standard VIP"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetTicketCancelledReport() throws Exception {
        TicketCancelledDto cancelled = TicketCancelledDto.builder().ticketTypeName("Standard VIP").cancelledCount(50L).build();
        when(analyticsService.getTicketCancelledReport(any(), any())).thenReturn(Collections.singletonList(cancelled));

        mockMvc.perform(get("/api/v1/analytics/tickets/cancelled"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ticketTypeName").value("Standard VIP"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRideSummary() throws Exception {
        RideSummaryDto summary = RideSummaryDto.builder().totalRides(15L).totalValidations(14200L).averageWaitingMinutes(12.5).build();
        when(analyticsService.getRideSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/rides/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRides").value(15));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetPopularRides() throws Exception {
        RidePopularityDto pop = RidePopularityDto.builder().rideId(1L).rideName("Roller Coaster").validationCount(4500L).build();
        when(analyticsService.getPopularRides(any(), any(), eq(5), eq("DESC"))).thenReturn(Collections.singletonList(pop));

        mockMvc.perform(get("/api/v1/analytics/rides/popular?limit=5&direction=DESC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].rideName").value("Roller Coaster"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRideCapacityReport() throws Exception {
        RideCapacityDto cap = RideCapacityDto.builder()
                .rideId(1L)
                .rideName("Roller Coaster")
                .timeSlot("10:00")
                .maxCapacity(100)
                .bookedCount(85)
                .currentWaitingCount(12)
                .occupancyRate(0.85)
                .build();
        when(analyticsService.getRideCapacityReport(eq(1L), any())).thenReturn(Collections.singletonList(cap));

        mockMvc.perform(get("/api/v1/analytics/rides/capacity?rideId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].rideName").value("Roller Coaster"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRideWaitingTimeReport() throws Exception {
        RideWaitingTimeDto waitDto = RideWaitingTimeDto.builder()
                .rideId(1L)
                .rideName("Roller Coaster")
                .avgQueueLength(15.0)
                .rideCapacity(50)
                .cycleDuration(180)
                .estimatedWaitMinutes(9.0)
                .build();
        when(analyticsService.getRideWaitingTimeReport(eq(1L))).thenReturn(Collections.singletonList(waitDto));

        mockMvc.perform(get("/api/v1/analytics/rides/waiting-time?rideId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].estimatedWaitMinutes").value(9.0));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetCustomerSummary() throws Exception {
        CustomerSummaryDto summary = CustomerSummaryDto.builder()
                .totalCustomers(5000L)
                .newCustomersCount(120L)
                .returningCustomersCount(1500L)
                .returningRate(0.3)
                .build();
        when(analyticsService.getCustomerSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/customers/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCustomers").value(5000));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetNewCustomerRegistrationTrend() throws Exception {
        CustomerRegistrationDto trend = CustomerRegistrationDto.builder().period("2026-07-10").newCustomersCount(8L).build();
        when(analyticsService.getNewCustomerRegistrationTrend(any(), any(), eq("DAILY"))).thenReturn(Collections.singletonList(trend));

        mockMvc.perform(get("/api/v1/analytics/customers/registration-trend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].newCustomersCount").value(8));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetReturningCustomersReport() throws Exception {
        CustomerReturningDto ret = CustomerReturningDto.builder().returningCustomersCount(450L).totalActiveCustomers(1500L).build();
        when(analyticsService.getReturningCustomersReport(any(), any())).thenReturn(ret);

        mockMvc.perform(get("/api/v1/analytics/customers/returning"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.returningCustomersCount").value(450));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetMembershipDistribution() throws Exception {
        CustomerMembershipDto dist = CustomerMembershipDto.builder().tierName("GOLD").memberCount(850L).build();
        when(analyticsService.getMembershipDistribution()).thenReturn(Collections.singletonList(dist));

        mockMvc.perform(get("/api/v1/analytics/customers/membership-distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].tierName").value("GOLD"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetParkingSummary() throws Exception {
        ParkingSummaryDto summary = ParkingSummaryDto.builder()
                .totalParkingLots(3L)
                .occupiedSpaces(120)
                .totalSpaces(500)
                .averageOccupancyRate(0.24)
                .build();
        when(analyticsService.getParkingSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/parking/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalParkingLots").value(3));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetParkingOccupancyReport() throws Exception {
        ParkingOccupancyDto report = ParkingOccupancyDto.builder()
                .parkingLotId(1L)
                .parkingLotName("Main Lot")
                .occupiedSpaces(80)
                .availableSpaces(120)
                .occupancyRate(0.4)
                .build();
        when(analyticsService.getParkingOccupancyReport(eq(1L), any(), any())).thenReturn(Collections.singletonList(report));

        mockMvc.perform(get("/api/v1/analytics/parking/occupancy?lotId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].parkingLotName").value("Main Lot"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetParkingRevenueReport() throws Exception {
        ParkingRevenueDto rev = ParkingRevenueDto.builder().parkingLotId(1L).parkingLotName("Main Lot").totalParkingFee(BigDecimal.valueOf(8500)).totalSessions(425L).build();
        when(analyticsService.getParkingRevenueReport(any(), any())).thenReturn(Collections.singletonList(rev));

        mockMvc.perform(get("/api/v1/analytics/parking/revenue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].totalSessions").value(425));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRetailSummary() throws Exception {
        RetailSummaryDto summary = RetailSummaryDto.builder().totalShops(5L).totalSales(BigDecimal.valueOf(450000)).totalItemsSold(1800L).build();
        when(analyticsService.getRetailSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/retail/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalShops").value(5));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetRetailSalesReport() throws Exception {
        RetailSalesDto sales = RetailSalesDto.builder().period("2026-07-10").totalSales(BigDecimal.valueOf(15000)).build();
        when(analyticsService.getRetailSalesReport(any(), any(), eq("DAILY"))).thenReturn(Collections.singletonList(sales));

        mockMvc.perform(get("/api/v1/analytics/retail/sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].totalSales").value(15000));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetPopularProductsReport() throws Exception {
        RetailProductsDto prod = RetailProductsDto.builder().itemId(1L).itemName("Toy Bear").totalQuantitySold(150L).totalRevenue(BigDecimal.valueOf(4500)).build();
        when(analyticsService.getPopularProductsReport(any(), any(), eq(10))).thenReturn(Collections.singletonList(prod));

        mockMvc.perform(get("/api/v1/analytics/retail/popular-products?limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].itemName").value("Toy Bear"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetPromotionSummary() throws Exception {
        PromotionSummaryDto summary = PromotionSummaryDto.builder().totalCampaigns(3L).totalCouponsUsed(85L).totalDiscountGiven(BigDecimal.valueOf(8500)).build();
        when(analyticsService.getPromotionSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/promotions/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalCampaigns").value(3));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetCouponUsagesReport() throws Exception {
        CouponPerformanceDto perf = CouponPerformanceDto.builder().couponId(1L).couponCode("DISC10").totalUses(45L).totalDiscountAmount(BigDecimal.valueOf(450)).build();
        when(analyticsService.getCouponUsagesReport(eq(1L), any(), any())).thenReturn(Collections.singletonList(perf));

        mockMvc.perform(get("/api/v1/analytics/promotions/coupon-usages?campaignId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].couponCode").value("DISC10"));
    }

    @Test
    @WithMockUser(roles = "SYSTEM_ADMIN")
    void testGetVoucherUsagesReport() throws Exception {
        VoucherSummaryDto summary = VoucherSummaryDto.builder().totalVouchersIssued(50L).totalVoucherBalance(BigDecimal.valueOf(5000)).totalVoucherSpent(BigDecimal.valueOf(1200)).build();
        when(analyticsService.getVoucherUsagesReport(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/analytics/promotions/vouchers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalVouchersIssued").value(50));
    }
}
