package com.smartpark.domain.dashboard.service.impl;

import com.smartpark.domain.dashboard.dto.DashboardSummaryDto;
import com.smartpark.domain.dashboard.dto.KpiCardDto;
import com.smartpark.domain.dashboard.dto.RevenueAnalyticsDto;
import com.smartpark.domain.dashboard.dto.VisitorFlowDto;
import com.smartpark.domain.dashboard.service.DashboardService;
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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final ParkingTransactionRepository parkingTransactionRepository;
    private final LockerTransactionRepository lockerTransactionRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final MembershipRepository membershipRepository;
    private final RideRepository rideRepository;
    private final RideCapacityRepository rideCapacityRepository;
    private final FeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final IncidentRepository incidentRepository;
    private final RideMaintenanceRepository rideMaintenanceRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start30 = now.minusDays(30);
        LocalDateTime start60 = now.minusDays(30); // Actually previous period is 30 days before start30

        // Adjusted dates for previous period
        LocalDateTime prevStart = now.minusDays(60);
        LocalDateTime prevEnd = now.minusDays(30);

        // 1. Total Revenue
        BigDecimal revCurrent = sumRevenue(start30, now);
        BigDecimal revPrevious = sumRevenue(prevStart, prevEnd);
        List<Double> revSparkline = getRevenueSparkline(now, 7);
        KpiCardDto totalRevenue = buildKpiCard(revCurrent.doubleValue(), revPrevious.doubleValue(), revSparkline);

        // 2. Total Profit
        BigDecimal profitCurrent = calculateProfit(revCurrent, start30.toLocalDate(), now.toLocalDate());
        BigDecimal profitPrevious = calculateProfit(revPrevious, prevStart.toLocalDate(), prevEnd.toLocalDate());
        List<Double> profitSparkline = getProfitSparkline(now, 7);
        KpiCardDto totalProfit = buildKpiCard(profitCurrent.doubleValue(), profitPrevious.doubleValue(), profitSparkline);

        // 3. Total Visitors
        long visitorsCurrent = checkInRepository.countByCheckInTimeBetween(start30, now);
        long visitorsPrevious = checkInRepository.countByCheckInTimeBetween(prevStart, prevEnd);
        List<Double> visitorsSparkline = getVisitorSparkline(now, 7);
        KpiCardDto totalVisitors = buildKpiCard(visitorsCurrent, visitorsPrevious, visitorsSparkline);

        // 4. Tickets Sold
        long tixCurrent = ticketRepository.countTicketsSoldBetween(start30, now);
        long tixPrevious = ticketRepository.countTicketsSoldBetween(prevStart, prevEnd);
        List<Double> tixSparkline = getTicketsSoldSparkline(now, 7);
        KpiCardDto ticketsSold = buildKpiCard(tixCurrent, tixPrevious, tixSparkline);

        // 5. Average Revenue Per Visitor
        double avgRevCurrent = visitorsCurrent > 0 ? revCurrent.doubleValue() / visitorsCurrent : 0.0;
        double avgRevPrevious = visitorsPrevious > 0 ? revPrevious.doubleValue() / visitorsPrevious : 0.0;
        List<Double> avgRevSparkline = getAvgRevSparkline(now, 7);
        KpiCardDto averageRevenuePerVisitor = buildKpiCard(avgRevCurrent, avgRevPrevious, avgRevSparkline);

        // 6. Parking Revenue
        BigDecimal parkCurrent = parkingTransactionRepository.sumAmountPaidByExitTimeBetween(start30, now);
        BigDecimal parkPrevious = parkingTransactionRepository.sumAmountPaidByExitTimeBetween(prevStart, prevEnd);
        List<Double> parkSparkline = getParkingSparkline(now, 7);
        KpiCardDto parkingRevenue = buildKpiCard(parkCurrent.doubleValue(), parkPrevious.doubleValue(), parkSparkline);

        // 7. Food Revenue
        BigDecimal foodCurrent = orderRepository.sumOrderItemPriceByTypeAndDateRange("FOOD", start30, now);
        BigDecimal foodPrevious = orderRepository.sumOrderItemPriceByTypeAndDateRange("FOOD", prevStart, prevEnd);
        List<Double> foodSparkline = getFoodSparkline(now, 7);
        KpiCardDto foodRevenue = buildKpiCard(foodCurrent.doubleValue(), foodPrevious.doubleValue(), foodSparkline);

        // 8. Retail Revenue
        BigDecimal retailCurrent = orderRepository.sumOrderItemPriceByTypeAndDateRange("RETAIL", start30, now);
        BigDecimal retailPrevious = orderRepository.sumOrderItemPriceByTypeAndDateRange("RETAIL", prevStart, prevEnd);
        List<Double> retailSparkline = getRetailSparkline(now, 7);
        KpiCardDto retailRevenue = buildKpiCard(retailCurrent.doubleValue(), retailPrevious.doubleValue(), retailSparkline);

        // 9. Active Memberships
        long memCurrent = membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE);
        long memPrevious = membershipRepository.countActiveMembershipsBefore(start30);
        List<Double> memSparkline = getMembershipsSparkline(now, 7);
        KpiCardDto activeMemberships = buildKpiCard(memCurrent, memPrevious, memSparkline);

        // 10. Ride Utilization
        List<Object[]> utilData = rideCapacityRepository.getUtilizationData();
        double utilCurrent = 0.0;
        if (!utilData.isEmpty() && utilData.get(0)[1] != null) {
            long booked = ((Number) utilData.get(0)[0]).longValue();
            long maxCap = ((Number) utilData.get(0)[1]).longValue();
            utilCurrent = maxCap > 0 ? (booked * 100.0 / maxCap) : 0.0;
        }
        double utilPrevious = 72.5; // Baseline
        List<Double> utilSparkline = simulateSparkline(utilCurrent, 7, 5.0);
        KpiCardDto rideUtilization = buildKpiCard(utilCurrent, utilPrevious, utilSparkline);

        // 11. Average Queue Time
        Double avgWait = rideCapacityRepository.getAverageWaitingCount();
        double queueCurrent = avgWait != null ? avgWait * 2.0 : 0.0; // 2 mins per waiting customer
        double queuePrevious = 18.0; // Baseline
        List<Double> queueSparkline = simulateSparkline(queueCurrent, 7, 3.0);
        KpiCardDto averageQueueTime = buildKpiCard(queueCurrent, queuePrevious, queueSparkline);

        // 12. Ride Availability
        long totalRides = rideRepository.count();
        long activeRides = rideRepository.countByStatus(Ride.RideStatus.ACTIVE);
        double availCurrent = totalRides > 0 ? (activeRides * 100.0 / totalRides) : 100.0;
        double availPrevious = 90.0; // Baseline
        List<Double> availSparkline = simulateSparkline(availCurrent, 7, 2.0);
        KpiCardDto rideAvailability = buildKpiCard(availCurrent, availPrevious, availSparkline);

        // 13. Customer Satisfaction
        Double satCurrentVal = feedbackRepository.getAverageRatingBetween(start30, now);
        Double satPreviousVal = feedbackRepository.getAverageRatingBetween(prevStart, prevEnd);
        double satCurrent = satCurrentVal != null ? satCurrentVal : 4.5;
        double satPrevious = satPreviousVal != null ? satPreviousVal : 4.2;
        List<Double> satSparkline = getSatisfactionSparkline(now, 7);
        KpiCardDto customerSatisfaction = buildKpiCard(satCurrent, satPrevious, satSparkline);

        // 14. Employee Productivity
        long empCount = employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE);
        double prodCurrent = empCount > 0 ? revCurrent.doubleValue() / empCount : 0.0;
        double prodPrevious = empCount > 0 ? revPrevious.doubleValue() / empCount : 0.0;
        List<Double> prodSparkline = simulateSparkline(prodCurrent, 7, prodCurrent * 0.1);
        KpiCardDto employeeProductivity = buildKpiCard(prodCurrent, prodPrevious, prodSparkline);

        // 15. Incident Count
        long incCurrent = incidentRepository.countByCreatedAtBetween(start30, now);
        long incPrevious = incidentRepository.countByCreatedAtBetween(prevStart, prevEnd);
        List<Double> incSparkline = getIncidentSparkline(now, 7);
        KpiCardDto incidentCount = buildKpiCard(incCurrent, incPrevious, incSparkline);

        return DashboardSummaryDto.builder()
                .totalRevenue(totalRevenue)
                .totalProfit(totalProfit)
                .totalVisitors(totalVisitors)
                .ticketsSold(ticketsSold)
                .averageRevenuePerVisitor(averageRevenuePerVisitor)
                .parkingRevenue(parkingRevenue)
                .foodRevenue(foodRevenue)
                .retailRevenue(retailRevenue)
                .activeMemberships(activeMemberships)
                .rideUtilization(rideUtilization)
                .averageQueueTime(averageQueueTime)
                .rideAvailability(rideAvailability)
                .customerSatisfaction(customerSatisfaction)
                .employeeProductivity(employeeProductivity)
                .incidentCount(incidentCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RevenueAnalyticsDto> getRevenueAnalytics(LocalDate startDate, LocalDate endDate, String groupBy) {
        if (startDate == null) startDate = LocalDate.now().minusDays(30);
        if (endDate == null) endDate = LocalDate.now();

        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.plusDays(1).atStartOfDay();

        // Query daily values
        List<Object[]> dailyOrders = orderRepository.sumDailyRevenueBetween(from, to);
        List<Object[]> dailyParking = parkingTransactionRepository.sumDailyParkingRevenueBetween(from, to);
        List<Object[]> dailyLockers = lockerTransactionRepository.sumDailyLockerRevenueBetween(from, to);
        List<Object[]> dailyMaintenance = rideMaintenanceRepository.sumDailyMaintenanceCostBetween(startDate, endDate);

        // Map daily entries
        Map<LocalDate, BigDecimal> orderMap = toLocalDateMap(dailyOrders);
        Map<LocalDate, BigDecimal> parkingMap = toLocalDateMap(dailyParking);
        Map<LocalDate, BigDecimal> lockerMap = toLocalDateMap(dailyLockers);
        Map<LocalDate, BigDecimal> maintMap = toLocalDateMap(dailyMaintenance);

        // Aggregate daily entries
        Map<String, RevenueAnalyticsDto> aggregatedMap = new LinkedHashMap<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);
        for (int i = 0; i <= daysBetween; i++) {
            LocalDate date = startDate.plusDays(i);

            BigDecimal ord = orderMap.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal park = parkingMap.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal lock = lockerMap.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal maint = maintMap.getOrDefault(date, BigDecimal.ZERO);

            BigDecimal rev = ord.add(park).add(lock);
            // Profit margin cost simulation: COGS = 30% of Orders, 20% of Parking/Locker + actual maintenance cost
            BigDecimal simulatedCost = maint.add(ord.multiply(BigDecimal.valueOf(0.3))).add(park.add(lock).multiply(BigDecimal.valueOf(0.2)));
            BigDecimal profit = rev.subtract(simulatedCost);

            // Determine period key
            String key;
            if ("WEEK".equalsIgnoreCase(groupBy)) {
                int weekNum = date.get(weekFields.weekOfWeekBasedYear());
                int year = date.get(weekFields.weekBasedYear());
                key = year + "-W" + String.format("%02d", weekNum);
            } else if ("MONTH".equalsIgnoreCase(groupBy)) {
                key = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            } else {
                key = date.toString(); // "DAY"
            }

            RevenueAnalyticsDto dto = aggregatedMap.computeIfAbsent(key, k -> RevenueAnalyticsDto.builder()
                    .period(k)
                    .revenue(BigDecimal.ZERO)
                    .cost(BigDecimal.ZERO)
                    .profit(BigDecimal.ZERO)
                    .build());

            dto.setRevenue(dto.getRevenue().add(rev));
            dto.setCost(dto.getCost().add(simulatedCost));
            dto.setProfit(dto.getProfit().add(profit));
        }

        return new ArrayList<>(aggregatedMap.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitorFlowDto> getVisitorFlow() {
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.atStartOfDay();
        LocalDateTime to = today.plusDays(1).atStartOfDay();

        List<Object[]> hourly = checkInRepository.countHourlyVisitorsBetween(from, to);
        Map<Integer, Long> countMap = new HashMap<>();
        for (Object[] row : hourly) {
            if (row[0] != null) {
                int hour = ((Number) row[0]).intValue();
                long count = ((Number) row[1]).longValue();
                countMap.put(hour, count);
            }
        }

        List<VisitorFlowDto> result = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            String hourLabel = String.format("%02d:00", h);
            Long count = countMap.getOrDefault(h, 0L);
            result.add(VisitorFlowDto.builder()
                    .hour(hourLabel)
                    .visitorCount(count)
                    .build());
        }

        return result;
    }

    // ─────────────────── HELPERS & SPARKLINE DATA GENERATION ───────────────────

    private BigDecimal sumRevenue(LocalDateTime from, LocalDateTime to) {
        BigDecimal ord = orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(from, to);
        BigDecimal park = parkingTransactionRepository.sumAmountPaidByExitTimeBetween(from, to);
        BigDecimal lock = lockerTransactionRepository.sumAmountPaidByEndTimeBetween(from, to);
        return ord.add(park).add(lock);
    }

    private BigDecimal calculateProfit(BigDecimal totalRevenue, LocalDate from, LocalDate to) {
        BigDecimal maint = rideMaintenanceRepository.sumCostByCompletionDateBetween(from, to);
        // Cost of operations simulation: 25% of total revenue
        BigDecimal operationsCost = totalRevenue.multiply(BigDecimal.valueOf(0.25));
        BigDecimal totalCost = maint.add(operationsCost);
        return totalRevenue.subtract(totalCost);
    }

    private List<Double> getRevenueSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add(sumRevenue(start, end).doubleValue());
        }
        return sparkline;
    }

    private List<Double> getProfitSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = now.minusDays(i).toLocalDate();
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.plusDays(1).atStartOfDay();
            BigDecimal rev = sumRevenue(start, end);
            sparkline.add(calculateProfit(rev, date, date).doubleValue());
        }
        return sparkline;
    }

    private List<Double> getVisitorSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add((double) checkInRepository.countByCheckInTimeBetween(start, end));
        }
        return sparkline;
    }

    private List<Double> getTicketsSoldSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add((double) ticketRepository.countTicketsSoldBetween(start, end));
        }
        return sparkline;
    }

    private List<Double> getAvgRevSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            double rev = sumRevenue(start, end).doubleValue();
            long vis = checkInRepository.countByCheckInTimeBetween(start, end);
            sparkline.add(vis > 0 ? rev / vis : 0.0);
        }
        return sparkline;
    }

    private List<Double> getParkingSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add(parkingTransactionRepository.sumAmountPaidByExitTimeBetween(start, end).doubleValue());
        }
        return sparkline;
    }

    private List<Double> getFoodSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add(orderRepository.sumOrderItemPriceByTypeAndDateRange("FOOD", start, end).doubleValue());
        }
        return sparkline;
    }

    private List<Double> getRetailSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add(orderRepository.sumOrderItemPriceByTypeAndDateRange("RETAIL", start, end).doubleValue());
        }
        return sparkline;
    }

    private List<Double> getMembershipsSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime date = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add((double) membershipRepository.countActiveMembershipsBefore(date));
        }
        return sparkline;
    }

    private List<Double> getSatisfactionSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            Double rating = feedbackRepository.getAverageRatingBetween(start, end);
            sparkline.add(rating != null ? rating : 4.5);
        }
        return sparkline;
    }

    private List<Double> getIncidentSparkline(LocalDateTime now, int days) {
        List<Double> sparkline = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime start = now.minusDays(i).toLocalDate().atStartOfDay();
            LocalDateTime end = now.minusDays(i).toLocalDate().plusDays(1).atStartOfDay();
            sparkline.add((double) incidentRepository.countByCreatedAtBetween(start, end));
        }
        return sparkline;
    }

    private List<Double> simulateSparkline(double currentVal, int length, double deviation) {
        List<Double> sparkline = new ArrayList<>();
        Random rand = new Random(42); // Seed for deterministic consistency
        for (int i = 0; i < length - 1; i++) {
            sparkline.add(currentVal - deviation + (rand.nextDouble() * 2 * deviation));
        }
        sparkline.add(currentVal);
        return sparkline;
    }

    private KpiCardDto buildKpiCard(double current, double previous, List<Double> sparkline) {
        double growth = 0.0;
        if (previous > 0) {
            growth = ((current - previous) / previous) * 100.0;
        }
        String trend = "FLAT";
        if (current > previous) {
            trend = "UP";
        } else if (current < previous) {
            trend = "DOWN";
        }

        // Round to 2 decimal places
        BigDecimal currentBD = BigDecimal.valueOf(current).setScale(2, RoundingMode.HALF_UP);
        BigDecimal prevBD = BigDecimal.valueOf(previous).setScale(2, RoundingMode.HALF_UP);
        BigDecimal growthBD = BigDecimal.valueOf(growth).setScale(2, RoundingMode.HALF_UP);

        // Round sparkline
        List<Double> roundedSparkline = new ArrayList<>();
        for (Double val : sparkline) {
            roundedSparkline.add(BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        return KpiCardDto.builder()
                .value(currentBD.doubleValue())
                .previousValue(prevBD.doubleValue())
                .growthPercentage(growthBD.doubleValue())
                .trend(trend)
                .sparklineData(roundedSparkline)
                .build();
    }

    private Map<LocalDate, BigDecimal> toLocalDateMap(List<Object[]> queryResults) {
        Map<LocalDate, BigDecimal> map = new HashMap<>();
        for (Object[] row : queryResults) {
            if (row[0] != null) {
                LocalDate date;
                if (row[0] instanceof Date) {
                    date = ((Date) row[0]).toLocalDate();
                } else if (row[0] instanceof LocalDate) {
                    date = (LocalDate) row[0];
                } else {
                    date = LocalDate.parse(row[0].toString());
                }
                BigDecimal val = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
                map.put(date, val);
            }
        }
        return map;
    }
}
