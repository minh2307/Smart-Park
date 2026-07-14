package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.AnalyticsDto.*;
import com.smartpark.domain.bi.projection.*;
import com.smartpark.domain.bi.service.impl.AnalyticsServiceImpl;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.order.repository.OrderItemRepository;
import com.smartpark.domain.order.repository.OrderRepository;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.repository.ParkingTransactionRepository;
import com.smartpark.domain.promotion.repository.CampaignRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.VoucherRepository;
import com.smartpark.domain.promotion.repository.VoucherUsageRepository;
import com.smartpark.domain.retail.repository.RetailShopRepository;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.entity.RideCapacity;
import com.smartpark.domain.ride.repository.RideCapacityRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private CheckInRepository checkInRepository;
    @Mock
    private RideRepository rideRepository;
    @Mock
    private RideCapacityRepository rideCapacityRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private MembershipRepository membershipRepository;
    @Mock
    private ParkingLotRepository parkingLotRepository;
    @Mock
    private ParkingTransactionRepository parkingTransactionRepository;
    @Mock
    private RetailShopRepository retailShopRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CouponUsageRepository couponUsageRepository;
    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private VoucherUsageRepository voucherUsageRepository;
    @Mock
    private CampaignRepository campaignRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private LocalDateTime from;
    private LocalDateTime to;

    @BeforeEach
    void setUp() {
        from = LocalDateTime.now().minusDays(30);
        to = LocalDateTime.now();
    }

    @Test
    void testGetDashboardSummary() {
        when(orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(any(), any())).thenReturn(BigDecimal.valueOf(50000));
        when(checkInRepository.countByCheckInTimeBetween(any(), any())).thenReturn(120L);
        when(parkingTransactionRepository.countByExitTimeIsNull()).thenReturn(50L);
        when(parkingLotRepository.sumTotalSpaces()).thenReturn(200);

        List<Object[]> utilData = new ArrayList<>();
        utilData.add(new Object[]{80, 100});
        when(rideCapacityRepository.getUtilizationData()).thenReturn(utilData);
        when(ticketRepository.countTicketsSoldBetween(any(), any())).thenReturn(500L);
        when(membershipRepository.countCreatedBetween(any(), any())).thenReturn(10L);

        DashboardSummaryDto result = analyticsService.getDashboardSummary();
        assertNotNull(result);
        assertEquals(120L, result.getActiveVisitors());
        assertEquals(50, result.getCurrentParkingOccupied());
        assertEquals(150, result.getCurrentParkingAvailable());
        assertEquals(0.8, result.getAverageRideUtilization());
        assertEquals(500L, result.getTicketsSoldToday());
        assertEquals(10L, result.getMembershipGrowthToday());
    }

    @Test
    void testGetOverview() {
        DailyRevenueProjection revProj = new DailyRevenueProjection() {
            @Override
            public String getPeriod() { return "2026-07-10"; }
            @Override
            public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(15000); }
            @Override
            public Long getTxCount() { return 100L; }
        };

        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));
        List<Object[]> visitors = Collections.singletonList(new Object[]{"2026-07-10", 125L});
        when(checkInRepository.countDailyVisitorsBetween(any(), any())).thenReturn(visitors);

        OverviewAnalyticsDto result = analyticsService.getOverview(30);
        assertNotNull(result);
        assertEquals(1, result.getTrends().size());
        assertEquals(125L, result.getTrends().get(0).getVisitors());
        assertEquals(BigDecimal.valueOf(15000), result.getTrends().get(0).getRevenue());
    }

    @Test
    void testGetKpiMetrics() {
        when(orderRepository.count()).thenReturn(100L);
        when(orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(any(), any())).thenReturn(BigDecimal.valueOf(10000));
        when(bookingRepository.countByCreatedAtBetween(any(), any())).thenReturn(50L);
        when(bookingRepository.countByStatusAndCreatedAtBetween(any(), any(), any())).thenReturn(40L);
        when(membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE)).thenReturn(1000L);
        when(membershipRepository.countByStatus(Membership.MembershipStatus.CANCELLED)).thenReturn(50L);
        when(membershipRepository.count()).thenReturn(1050L);
        when(checkInRepository.countByCheckInTimeBetween(any(), any())).thenReturn(200L);

        KpiResponseDto result = analyticsService.getKpiMetrics(from, to);
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(100).setScale(2), result.getAverageOrderValue());
        assertEquals(0.8, result.getConversionRate());
        assertEquals(1000L, result.getTotalActiveMembers());
        assertEquals(50.0 / 1050.0, result.getMemberChurnRate(), 0.001);
        assertEquals(BigDecimal.valueOf(50).setScale(2), result.getRevenuePerVisitor());
    }

    @Test
    void testGetRevenueReport() {
        DailyRevenueProjection revProj = new DailyRevenueProjection() {
            @Override
            public String getPeriod() { return "2026-07-10"; }
            @Override
            public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(15000); }
            @Override
            public Long getTxCount() { return 100L; }
        };

        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));
        when(orderRepository.getMonthlyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));
        when(orderRepository.getYearlyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));

        List<RevenueTrendDto> daily = analyticsService.getRevenueReport(from, to, "DAILY");
        assertEquals(1, daily.size());

        List<RevenueTrendDto> monthly = analyticsService.getRevenueReport(from, to, "MONTHLY");
        assertEquals(1, monthly.size());

        List<RevenueTrendDto> yearly = analyticsService.getRevenueReport(from, to, "YEARLY");
        assertEquals(1, yearly.size());
    }

    @Test
    void testGetDailyMonthlyYearlyRevenue() {
        DailyRevenueProjection revProj = new DailyRevenueProjection() {
            @Override
            public String getPeriod() { return "2026-07-10"; }
            @Override
            public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(15000); }
            @Override
            public Long getTxCount() { return 100L; }
        };
        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));
        when(orderRepository.getMonthlyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));
        when(orderRepository.getYearlyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));

        assertNotNull(analyticsService.getDailyRevenue(from, to));
        assertNotNull(analyticsService.getMonthlyRevenue(2026));
        assertNotNull(analyticsService.getYearlyRevenue());
    }

    @Test
    void testGetRevenueByTicketAndPayment() {
        RevenueByTypeProjection proj = new RevenueByTypeProjection() {
            @Override
            public String getTicketCategory() { return "VIP"; }
            @Override
            public BigDecimal getRevenue() { return BigDecimal.valueOf(5000); }
        };
        when(orderRepository.getRevenueByTicketCategory(any(), any())).thenReturn(Collections.singletonList(proj));
        when(orderRepository.getRevenueByPaymentMethod(any(), any())).thenReturn(Collections.singletonList(proj));

        assertNotNull(analyticsService.getRevenueByTicket(from, to));
        assertNotNull(analyticsService.getRevenueByPayment(from, to));
    }

    @Test
    void testGetBookingSummaryAndBreakdown() {
        when(bookingRepository.countByCreatedAtBetween(any(), any())).thenReturn(100L);
        when(bookingRepository.countByStatusAndCreatedAtBetween(any(), any(), any())).thenReturn(90L);
        when(bookingRepository.sumTotalAmountByStatusAndCreatedAtBetween(any(), any(), any())).thenReturn(BigDecimal.valueOf(9000));
        when(bookingRepository.countBookingsByStatusInRange(any(), any())).thenReturn(Collections.singletonList(new Object[]{"PAID", 90L}));

        assertNotNull(analyticsService.getBookingSummary(from, to));
        assertNotNull(analyticsService.getBookingStatusBreakdown(from, to));
    }

    @Test
    void testGetBookingTrend() {
        List<Object[]> list = Collections.singletonList(new Object[]{"2026-07-10", 42L});
        when(bookingRepository.getBookingTrendDaily(any(), any())).thenReturn(list);
        when(bookingRepository.getBookingTrendMonthly(any(), any())).thenReturn(list);
        when(bookingRepository.getBookingTrendYearly(any(), any())).thenReturn(list);

        assertNotNull(analyticsService.getBookingTrend(from, to, "DAILY"));
        assertNotNull(analyticsService.getBookingTrend(from, to, "MONTHLY"));
        assertNotNull(analyticsService.getBookingTrend(from, to, "YEARLY"));
    }

    @Test
    void testGetTicketSummaryAndReports() {
        when(ticketRepository.countTicketsSoldBetween(any(), any())).thenReturn(1000L);
        when(ticketRepository.countByStatusAndCreatedAtBetween(Ticket.TicketStatus.USED, from, to)).thenReturn(800L);
        when(ticketRepository.countTicketsSoldGroupedByType(any(), any())).thenReturn(Collections.singletonList(new Object[]{"VIP", 500L}));
        when(ticketRepository.countTicketsUsedGroupedByType(any(), any())).thenReturn(Collections.singletonList(new Object[]{"VIP", 400L}));
        when(ticketRepository.countTicketsCancelledGroupedByType(any(), any())).thenReturn(Collections.singletonList(new Object[]{"VIP", 100L}));

        assertNotNull(analyticsService.getTicketSummary(from, to));
        assertNotNull(analyticsService.getTicketSoldReport(from, to));
        assertNotNull(analyticsService.getTicketUsedReport(from, to));
        assertNotNull(analyticsService.getTicketCancelledReport(from, to));
    }

    @Test
    void testGetRideSummaryAndPopular() {
        when(rideRepository.count()).thenReturn(10L);
        when(ticketRepository.countTicketsSoldBetween(any(), any())).thenReturn(1000L);
        when(rideCapacityRepository.getAverageWaitingCount()).thenReturn(15.5);

        PopularRideProjection popProj = new PopularRideProjection() {
            @Override
            public Long getRideId() { return 1L; }
            @Override
            public String getRideName() { return "Roller Coaster"; }
            @Override
            public Long getValidationCount() { return 100L; }
        };
        when(rideRepository.getPopularRides(any(), any())).thenReturn(Collections.singletonList(popProj));

        assertNotNull(analyticsService.getRideSummary(from, to));
        assertNotNull(analyticsService.getPopularRides(from, to, 5, "DESC"));
        assertNotNull(analyticsService.getPopularRides(from, to, 5, "ASC"));
    }

    @Test
    void testGetRideCapacityAndWaitingTime() {
        Ride ride = new Ride();
        ride.setId(1L);
        ride.setName("Coaster");
        RideCapacity rc = new RideCapacity();
        rc.setRide(ride);
        rc.setTimeSlot(LocalTime.of(10, 0));
        rc.setMaxCapacity(100);
        rc.setBookedCount(80);
        rc.setCurrentWaitingCount(10);

        when(rideCapacityRepository.findByRideId(1L)).thenReturn(Collections.singletonList(rc));
        
        RideWaitingTimeProjection waitProj = new RideWaitingTimeProjection() {
            @Override
            public Long getRideId() { return 1L; }
            @Override
            public String getRideName() { return "Coaster"; }
            @Override
            public Double getAvgQueueLength() { return 10.0; }
            @Override
            public Integer getRideCapacity() { return 100; }
            @Override
            public Integer getCycleDuration() { return 180; }
            @Override
            public Double getEstimatedWaitMinutes() { return 6.0; }
        };
        when(rideRepository.getRideWaitingTime(1L)).thenReturn(Optional.of(waitProj));
        when(rideRepository.getRideWaitingTimes()).thenReturn(Collections.singletonList(waitProj));

        assertNotNull(analyticsService.getRideCapacityReport(1L, LocalDate.now()));
        assertNotNull(analyticsService.getRideWaitingTimeReport(1L));
        assertNotNull(analyticsService.getRideWaitingTimeReport(null));
    }

    @Test
    void testGetCustomerSummaryAndTrends() {
        when(customerRepository.count()).thenReturn(100L);
        when(customerRepository.countByCreatedAtBetween(any(), any())).thenReturn(10L);
        when(customerRepository.countReturningCustomers(any(), any())).thenReturn(5L);

        CustomerRegistrationProjection proj = new CustomerRegistrationProjection() {
            @Override
            public String getPeriod() { return "2026-07-10"; }
            @Override
            public Long getNewCustomersCount() { return 5L; }
        };
        when(customerRepository.getNewCustomersTrendDaily(any(), any())).thenReturn(Collections.singletonList(proj));
        when(customerRepository.getNewCustomersTrendMonthly(any(), any())).thenReturn(Collections.singletonList(proj));
        when(customerRepository.getNewCustomersTrendYearly(any(), any())).thenReturn(Collections.singletonList(proj));
        when(customerRepository.countCustomersByMembershipTier()).thenReturn(Collections.singletonList(new Object[]{"GOLD", 20L}));

        assertNotNull(analyticsService.getCustomerSummary(from, to));
        assertNotNull(analyticsService.getNewCustomerRegistrationTrend(from, to, "DAILY"));
        assertNotNull(analyticsService.getNewCustomerRegistrationTrend(from, to, "MONTHLY"));
        assertNotNull(analyticsService.getNewCustomerRegistrationTrend(from, to, "YEARLY"));
        assertNotNull(analyticsService.getReturningCustomersReport(from, to));
        assertNotNull(analyticsService.getMembershipDistribution());
    }

    @Test
    void testGetParkingSummaryAndReports() {
        when(parkingLotRepository.countByDeletedAtIsNull()).thenReturn(5L);
        when(parkingLotRepository.sumOccupiedSpaces()).thenReturn(100);
        when(parkingLotRepository.sumTotalSpaces()).thenReturn(500);

        ParkingLot pl = new ParkingLot();
        pl.setId(1L);
        pl.setName("Lot 1");
        pl.setTotalSpaces(100);
        pl.setOccupiedSpaces(40);
        when(parkingLotRepository.findAll()).thenReturn(Collections.singletonList(pl));

        ParkingOccupancyProjection proj = new ParkingOccupancyProjection() {
            @Override
            public Long getLotId() { return 1L; }
            @Override
            public String getLotName() { return "Lot 1"; }
            @Override
            public BigDecimal getTotalParkingFee() { return BigDecimal.valueOf(1000); }
            @Override
            public Long getTotalSessions() { return 50L; }
        };
        when(parkingTransactionRepository.getParkingOccupancyAndRevenueReport(any(), any())).thenReturn(Collections.singletonList(proj));

        assertNotNull(analyticsService.getParkingSummary(from, to));
        assertNotNull(analyticsService.getParkingOccupancyReport(1L, from, to));
        assertNotNull(analyticsService.getParkingRevenueReport(from, to));
    }

    @Test
    void testGetRetailSummaryAndReports() {
        when(retailShopRepository.count()).thenReturn(3L);
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange("RETAIL", from, to)).thenReturn(BigDecimal.valueOf(2000));
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange("FOOD", from, to)).thenReturn(BigDecimal.valueOf(1500));
        when(orderItemRepository.countItemsSoldBetween(any(), any())).thenReturn(300L);

        DailyRevenueProjection revProj = new DailyRevenueProjection() {
            @Override
            public String getPeriod() { return "2026-07-10"; }
            @Override
            public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(15000); }
            @Override
            public Long getTxCount() { return 100L; }
        };
        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(revProj));

        ProductSalesReportProjection prodProj = new ProductSalesReportProjection() {
            @Override
            public Long getItemId() { return 1L; }
            @Override
            public String getItemName() { return "T-shirt"; }
            @Override
            public Long getTotalQuantitySold() { return 50L; }
            @Override
            public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(1500); }
        };
        when(orderItemRepository.getProductSalesReport(any(), any())).thenReturn(Collections.singletonList(prodProj));

        assertNotNull(analyticsService.getRetailSummary(from, to));
        assertNotNull(analyticsService.getRetailSalesReport(from, to, "DAILY"));
        assertNotNull(analyticsService.getPopularProductsReport(from, to, 5));
    }

    @Test
    void testGetPromotionAndVoucherSummary() {
        when(campaignRepository.count()).thenReturn(2L);
        when(couponUsageRepository.countUsagesBetween(any(), any())).thenReturn(50L);

        CouponPerformanceProjection perfProj = new CouponPerformanceProjection() {
            @Override
            public Long getCouponId() { return 1L; }
            @Override
            public String getCouponCode() { return "DISC10"; }
            @Override
            public Long getTotalUses() { return 30L; }
            @Override
            public BigDecimal getTotalDiscountAmount() { return BigDecimal.valueOf(300); }
        };
        when(couponUsageRepository.getCouponPerformanceReport(any(), any())).thenReturn(Collections.singletonList(perfProj));
        when(voucherRepository.count()).thenReturn(100L);
        when(voucherRepository.sumVoucherValueIssued(any(), any())).thenReturn(BigDecimal.valueOf(5000));
        when(voucherUsageRepository.sumAmountUsedBetween(any(), any())).thenReturn(BigDecimal.valueOf(1200));

        assertNotNull(analyticsService.getPromotionSummary(from, to));
        assertNotNull(analyticsService.getCouponUsagesReport(1L, from, to));
        assertNotNull(analyticsService.getVoucherUsagesReport(from, to));
    }
}
