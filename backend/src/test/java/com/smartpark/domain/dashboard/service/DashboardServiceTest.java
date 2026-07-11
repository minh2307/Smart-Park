package com.smartpark.domain.dashboard.service;

import com.smartpark.domain.dashboard.dto.DashboardSummaryDto;
import com.smartpark.domain.dashboard.dto.RevenueAnalyticsDto;
import com.smartpark.domain.dashboard.dto.VisitorFlowDto;
import com.smartpark.domain.dashboard.service.impl.DashboardServiceImpl;
import com.smartpark.domain.order.repository.OrderRepository;
import com.smartpark.domain.parking.repository.ParkingTransactionRepository;
import com.smartpark.domain.locker.repository.LockerTransactionRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ride.repository.RideCapacityRepository;
import com.smartpark.domain.feedback.repository.FeedbackRepository;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.incident.repository.IncidentRepository;
import com.smartpark.domain.ride.repository.RideMaintenanceRepository;

import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.employee.entity.Employee;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ParkingTransactionRepository parkingTransactionRepository;
    @Mock private LockerTransactionRepository lockerTransactionRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private CheckInRepository checkInRepository;
    @Mock private MembershipRepository membershipRepository;
    @Mock private RideRepository rideRepository;
    @Mock private RideCapacityRepository rideCapacityRepository;
    @Mock private FeedbackRepository feedbackRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private IncidentRepository incidentRepository;
    @Mock private RideMaintenanceRepository rideMaintenanceRepository;

    @InjectMocks private DashboardServiceImpl dashboardService;

    @Test
    void testGetDashboardSummary() {
        // Setup mock returns for order sum
        when(orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(any(), any())).thenReturn(new BigDecimal("100.00"));
        when(parkingTransactionRepository.sumAmountPaidByExitTimeBetween(any(), any())).thenReturn(new BigDecimal("50.00"));
        when(lockerTransactionRepository.sumAmountPaidByEndTimeBetween(any(), any())).thenReturn(new BigDecimal("25.00"));
        when(rideMaintenanceRepository.sumCostByCompletionDateBetween(any(), any())).thenReturn(new BigDecimal("10.00"));

        // Setup check-ins
        when(checkInRepository.countByCheckInTimeBetween(any(), any())).thenReturn(10L);
        // Setup tickets
        when(ticketRepository.countTicketsSoldBetween(any(), any())).thenReturn(8L);
        // Setup items
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange(eq("FOOD"), any(), any())).thenReturn(new BigDecimal("40.00"));
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange(eq("RETAIL"), any(), any())).thenReturn(new BigDecimal("30.00"));

        // Setup membership
        when(membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE)).thenReturn(5L);
        when(membershipRepository.countActiveMembershipsBefore(any())).thenReturn(4L);

        // Setup utilization data
        List<Object[]> utilData = new ArrayList<>();
        utilData.add(new Object[]{80L, 100L});
        when(rideCapacityRepository.getUtilizationData()).thenReturn(utilData);
        when(rideCapacityRepository.getAverageWaitingCount()).thenReturn(5.0);

        // Setup ride
        when(rideRepository.count()).thenReturn(10L);
        when(rideRepository.countByStatus(Ride.RideStatus.ACTIVE)).thenReturn(9L);

        // Setup feedback
        when(feedbackRepository.getAverageRatingBetween(any(), any())).thenReturn(4.5);

        // Setup employee
        when(employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(2L);

        // Setup incident
        when(incidentRepository.countByCreatedAtBetween(any(), any())).thenReturn(1L);

        // Run
        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        // Verification
        assertThat(summary).isNotNull();
        assertThat(summary.getTotalRevenue().getValue()).isEqualTo(175.00);
        assertThat(summary.getFoodRevenue().getValue()).isEqualTo(40.00);
        assertThat(summary.getRetailRevenue().getValue()).isEqualTo(30.00);
        assertThat(summary.getTicketsSold().getValue()).isEqualTo(8.00);
        assertThat(summary.getActiveMemberships().getValue()).isEqualTo(5.00);
        assertThat(summary.getRideUtilization().getValue()).isEqualTo(80.00);
        assertThat(summary.getAverageQueueTime().getValue()).isEqualTo(10.00);
        assertThat(summary.getRideAvailability().getValue()).isEqualTo(90.00);
        assertThat(summary.getCustomerSatisfaction().getValue()).isEqualTo(4.50);
        assertThat(summary.getIncidentCount().getValue()).isEqualTo(1.00);
    }

    @Test
    void testGetDashboardSummary_EmptyUtilizationAndRides() {
        // Setup mock returns for order sum
        when(orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(any(), any())).thenReturn(BigDecimal.ZERO);
        when(parkingTransactionRepository.sumAmountPaidByExitTimeBetween(any(), any())).thenReturn(BigDecimal.ZERO);
        when(lockerTransactionRepository.sumAmountPaidByEndTimeBetween(any(), any())).thenReturn(BigDecimal.ZERO);
        when(rideMaintenanceRepository.sumCostByCompletionDateBetween(any(), any())).thenReturn(BigDecimal.ZERO);

        // Setup check-ins
        when(checkInRepository.countByCheckInTimeBetween(any(), any())).thenReturn(0L);
        // Setup tickets
        when(ticketRepository.countTicketsSoldBetween(any(), any())).thenReturn(0L);
        // Setup items
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange(eq("FOOD"), any(), any())).thenReturn(BigDecimal.ZERO);
        when(orderRepository.sumOrderItemPriceByTypeAndDateRange(eq("RETAIL"), any(), any())).thenReturn(BigDecimal.ZERO);

        // Setup membership
        when(membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE)).thenReturn(0L);
        when(membershipRepository.countActiveMembershipsBefore(any())).thenReturn(0L);

        // Setup utilization data - empty
        when(rideCapacityRepository.getUtilizationData()).thenReturn(Collections.emptyList());
        when(rideCapacityRepository.getAverageWaitingCount()).thenReturn(null);

        // Setup ride
        when(rideRepository.count()).thenReturn(0L);
        when(rideRepository.countByStatus(Ride.RideStatus.ACTIVE)).thenReturn(0L);

        // Setup feedback
        when(feedbackRepository.getAverageRatingBetween(any(), any())).thenReturn(null);

        // Setup employee
        when(employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE)).thenReturn(0L);

        // Setup incident
        when(incidentRepository.countByCreatedAtBetween(any(), any())).thenReturn(0L);

        // Run
        DashboardSummaryDto summary = dashboardService.getDashboardSummary();

        // Verification
        assertThat(summary).isNotNull();
        assertThat(summary.getTotalRevenue().getValue()).isEqualTo(0.0);
        assertThat(summary.getRideUtilization().getValue()).isEqualTo(0.0);
        assertThat(summary.getAverageQueueTime().getValue()).isEqualTo(0.0);
        assertThat(summary.getRideAvailability().getValue()).isEqualTo(100.0);
        assertThat(summary.getCustomerSatisfaction().getValue()).isEqualTo(4.5);
    }

    @Test
    void testGetRevenueAnalytics_DayGroup() {
        LocalDate start = LocalDate.of(2026, 7, 8);
        LocalDate end = LocalDate.of(2026, 7, 10);

        List<Object[]> orders = new ArrayList<>();
        orders.add(new Object[]{java.sql.Date.valueOf(start), new BigDecimal("100.00")});

        List<Object[]> parking = new ArrayList<>();
        parking.add(new Object[]{start, new BigDecimal("50.00")});

        List<Object[]> lockers = new ArrayList<>();
        lockers.add(new Object[]{"2026-07-08", new BigDecimal("20.00")});

        List<Object[]> maintenance = new ArrayList<>();
        maintenance.add(new Object[]{start, new BigDecimal("10.00")});

        when(orderRepository.sumDailyRevenueBetween(any(), any())).thenReturn(orders);
        when(parkingTransactionRepository.sumDailyParkingRevenueBetween(any(), any())).thenReturn(parking);
        when(lockerTransactionRepository.sumDailyLockerRevenueBetween(any(), any())).thenReturn(lockers);
        when(rideMaintenanceRepository.sumDailyMaintenanceCostBetween(any(), any())).thenReturn(maintenance);

        List<RevenueAnalyticsDto> result = dashboardService.getRevenueAnalytics(start, end, "DAY");

        assertThat(result).hasSize(3);
        RevenueAnalyticsDto firstDay = result.get(0);
        assertThat(firstDay.getPeriod()).isEqualTo("2026-07-08");
        assertThat(firstDay.getRevenue()).isEqualByComparingTo("170.00");
    }

    @Test
    void testGetRevenueAnalytics_WeekGroup() {
        LocalDate start = LocalDate.of(2026, 7, 8);
        LocalDate end = LocalDate.of(2026, 7, 10);

        when(orderRepository.sumDailyRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(parkingTransactionRepository.sumDailyParkingRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(lockerTransactionRepository.sumDailyLockerRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(rideMaintenanceRepository.sumDailyMaintenanceCostBetween(any(), any())).thenReturn(Collections.emptyList());

        List<RevenueAnalyticsDto> result = dashboardService.getRevenueAnalytics(start, end, "WEEK");

        assertThat(result).hasSize(1);
    }

    @Test
    void testGetRevenueAnalytics_MonthGroup() {
        LocalDate start = LocalDate.of(2026, 7, 8);
        LocalDate end = LocalDate.of(2026, 7, 10);

        when(orderRepository.sumDailyRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(parkingTransactionRepository.sumDailyParkingRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(lockerTransactionRepository.sumDailyLockerRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(rideMaintenanceRepository.sumDailyMaintenanceCostBetween(any(), any())).thenReturn(Collections.emptyList());

        List<RevenueAnalyticsDto> result = dashboardService.getRevenueAnalytics(start, end, "MONTH");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPeriod()).isEqualTo("2026-07");
    }

    @Test
    void testGetRevenueAnalytics_NullDates() {
        when(orderRepository.sumDailyRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(parkingTransactionRepository.sumDailyParkingRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(lockerTransactionRepository.sumDailyLockerRevenueBetween(any(), any())).thenReturn(Collections.emptyList());
        when(rideMaintenanceRepository.sumDailyMaintenanceCostBetween(any(), any())).thenReturn(Collections.emptyList());

        List<RevenueAnalyticsDto> result = dashboardService.getRevenueAnalytics(null, null, "DAY");

        assertThat(result).isNotEmpty();
    }

    @Test
    void testGetVisitorFlow() {
        List<Object[]> flowData = new ArrayList<>();
        flowData.add(new Object[]{8, 120L});
        flowData.add(new Object[]{9, 245L});
        when(checkInRepository.countHourlyVisitorsBetween(any(), any())).thenReturn(flowData);

        List<VisitorFlowDto> result = dashboardService.getVisitorFlow();

        assertThat(result).hasSize(24);
        assertThat(result.get(8).getVisitorCount()).isEqualTo(120L);
        assertThat(result.get(9).getVisitorCount()).isEqualTo(245L);
        assertThat(result.get(10).getVisitorCount()).isEqualTo(0L);
    }
}
