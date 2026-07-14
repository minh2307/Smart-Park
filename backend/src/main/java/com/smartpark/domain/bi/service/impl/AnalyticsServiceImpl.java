package com.smartpark.domain.bi.service.impl;

import com.smartpark.domain.bi.dto.AnalyticsDto.*;
import com.smartpark.domain.bi.projection.*;
import com.smartpark.domain.bi.service.AnalyticsService;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.order.repository.OrderItemRepository;
import com.smartpark.domain.order.repository.OrderRepository;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.repository.ParkingTransactionRepository;
import com.smartpark.domain.promotion.repository.CampaignRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.VoucherRepository;
import com.smartpark.domain.promotion.repository.VoucherUsageRepository;
import com.smartpark.domain.retail.repository.RetailShopRepository;
import com.smartpark.domain.ride.entity.RideCapacity;
import com.smartpark.domain.ride.repository.RideCapacityRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final RideRepository rideRepository;
    private final RideCapacityRepository rideCapacityRepository;
    private final CustomerRepository customerRepository;
    private final MembershipRepository membershipRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingTransactionRepository parkingTransactionRepository;
    private final RetailShopRepository retailShopRepository;
    private final OrderItemRepository orderItemRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final CampaignRepository campaignRepository;

    @Override
    public DashboardSummaryDto getDashboardSummary() {
        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime todayEnd = LocalDateTime.now().with(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(LocalDateTime.of(1970, 1, 1, 0, 0), LocalDateTime.now());
        BigDecimal todayRevenue = orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(todayStart, todayEnd);
        long activeVisitors = checkInRepository.countByCheckInTimeBetween(todayStart, todayEnd);
        int currentParkingOccupied = (int) parkingTransactionRepository.countByExitTimeIsNull();
        int totalSpaces = parkingLotRepository.sumTotalSpaces();
        int currentParkingAvailable = Math.max(0, totalSpaces - currentParkingOccupied);

        List<Object[]> utilData = rideCapacityRepository.getUtilizationData();
        double averageRideUtilization = 0.0;
        if (!utilData.isEmpty() && utilData.get(0)[1] != null && ((Number) utilData.get(0)[1]).doubleValue() > 0) {
            double booked = ((Number) utilData.get(0)[0]).doubleValue();
            double maxCap = ((Number) utilData.get(0)[1]).doubleValue();
            averageRideUtilization = booked / maxCap;
        }

        long ticketsSoldToday = ticketRepository.countTicketsSoldBetween(todayStart, todayEnd);
        long membershipGrowthToday = membershipRepository.countCreatedBetween(todayStart, todayEnd);

        return DashboardSummaryDto.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .activeVisitors(activeVisitors)
                .currentParkingOccupied(currentParkingOccupied)
                .currentParkingAvailable(currentParkingAvailable)
                .averageRideUtilization(averageRideUtilization)
                .ticketsSoldToday(ticketsSoldToday)
                .membershipGrowthToday(membershipGrowthToday)
                .build();
    }

    @Override
    public OverviewAnalyticsDto getOverview(int durationDays) {
        LocalDateTime from = LocalDateTime.now().minusDays(durationDays).with(LocalTime.MIN);
        LocalDateTime to = LocalDateTime.now().with(LocalTime.MAX);

        List<DailyRevenueProjection> revenueTrend = orderRepository.getDailyRevenueTrend(from, to);
        List<Object[]> visitorTrend = checkInRepository.countDailyVisitorsBetween(from, to);

        Map<String, Long> visitorMap = new HashMap<>();
        for (Object[] obj : visitorTrend) {
            if (obj[0] != null && obj[1] != null) {
                visitorMap.put(obj[0].toString(), ((Number) obj[1]).longValue());
            }
        }

        List<OverviewTrendItem> trends = new ArrayList<>();
        for (DailyRevenueProjection p : revenueTrend) {
            long visitors = visitorMap.getOrDefault(p.getPeriod(), 0L);
            trends.add(OverviewTrendItem.builder()
                    .date(p.getPeriod())
                    .revenue(p.getTotalRevenue())
                    .visitors(visitors)
                    .build());
        }

        return OverviewAnalyticsDto.builder().trends(trends).build();
    }

    @Override
    public KpiResponseDto getKpiMetrics(LocalDateTime from, LocalDateTime to) {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatusPaidAndCreatedAtBetween(LocalDateTime.of(1970, 1, 1, 0, 0), LocalDateTime.now());
        BigDecimal averageOrderValue = totalOrders > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;

        long totalBookings = bookingRepository.countByCreatedAtBetween(from, to);
        long completedBookings = bookingRepository.countByStatusAndCreatedAtBetween(Booking.BookingStatus.PAID, from, to);
        double conversionRate = totalBookings > 0 ? (double) completedBookings / totalBookings : 1.0;

        long totalActiveMembers = membershipRepository.countByStatus(Membership.MembershipStatus.ACTIVE);
        long totalCancelledMembers = membershipRepository.countByStatus(Membership.MembershipStatus.CANCELLED);
        long totalMembers = membershipRepository.count();
        double memberChurnRate = totalMembers > 0 ? (double) totalCancelledMembers / totalMembers : 0.0;

        long activeVisitors = checkInRepository.countByCheckInTimeBetween(from, to);
        BigDecimal revenuePerVisitor = activeVisitors > 0 
                ? totalRevenue.divide(BigDecimal.valueOf(activeVisitors), 2, RoundingMode.HALF_UP) 
                : totalRevenue;

        return KpiResponseDto.builder()
                .averageOrderValue(averageOrderValue)
                .conversionRate(conversionRate)
                .totalActiveMembers(totalActiveMembers)
                .memberChurnRate(memberChurnRate)
                .revenuePerVisitor(revenuePerVisitor)
                .build();
    }

    @Override
    public List<RevenueTrendDto> getRevenueReport(LocalDateTime from, LocalDateTime to, String groupBy) {
        if ("MONTHLY".equalsIgnoreCase(groupBy)) {
            return orderRepository.getMonthlyRevenueTrend(from, to).stream()
                    .map(p -> RevenueTrendDto.builder().period(p.getPeriod()).totalRevenue(p.getTotalRevenue()).transactionCount(p.getTxCount()).build())
                    .collect(Collectors.toList());
        } else if ("YEARLY".equalsIgnoreCase(groupBy)) {
            return orderRepository.getYearlyRevenueTrend(from, to).stream()
                    .map(p -> RevenueTrendDto.builder().period(p.getPeriod()).totalRevenue(p.getTotalRevenue()).transactionCount(p.getTxCount()).build())
                    .collect(Collectors.toList());
        } else {
            return orderRepository.getDailyRevenueTrend(from, to).stream()
                    .map(p -> RevenueTrendDto.builder().period(p.getPeriod()).totalRevenue(p.getTotalRevenue()).transactionCount(p.getTxCount()).build())
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<RevenueTrendDto> getDailyRevenue(LocalDateTime from, LocalDateTime to) {
        return getRevenueReport(from, to, "DAILY");
    }

    @Override
    public List<RevenueTrendDto> getMonthlyRevenue(int year) {
        LocalDateTime from = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(year, 12, 31, 23, 59, 59);
        return getRevenueReport(from, to, "MONTHLY");
    }

    @Override
    public List<RevenueTrendDto> getYearlyRevenue() {
        LocalDateTime from = LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.now();
        return getRevenueReport(from, to, "YEARLY");
    }

    @Override
    public List<RevenueByTypeDto> getRevenueByTicket(LocalDateTime from, LocalDateTime to) {
        return orderRepository.getRevenueByTicketCategory(from, to).stream()
                .map(p -> RevenueByTypeDto.builder().ticketCategory(p.getTicketCategory()).revenue(p.getRevenue()).build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RevenueByTypeDto> getRevenueByPayment(LocalDateTime from, LocalDateTime to) {
        return orderRepository.getRevenueByPaymentMethod(from, to).stream()
                .map(p -> RevenueByTypeDto.builder().ticketCategory(p.getTicketCategory()).revenue(p.getRevenue()).build())
                .collect(Collectors.toList());
    }

    @Override
    public BookingSummaryDto getBookingSummary(LocalDateTime from, LocalDateTime to) {
        long totalBookings = bookingRepository.countByCreatedAtBetween(from, to);
        long completedBookings = bookingRepository.countByStatusAndCreatedAtBetween(Booking.BookingStatus.PAID, from, to);
        BigDecimal totalAmount = bookingRepository.sumTotalAmountByStatusAndCreatedAtBetween(Booking.BookingStatus.PAID, from, to);
        double successRate = totalBookings > 0 ? (double) completedBookings / totalBookings : 1.0;

        return BookingSummaryDto.builder()
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .totalAmount(totalAmount)
                .paymentSuccessRate(successRate)
                .build();
    }

    @Override
    public List<BookingStatusDto> getBookingStatusBreakdown(LocalDateTime from, LocalDateTime to) {
        return bookingRepository.countBookingsByStatusInRange(from, to).stream()
                .map(obj -> BookingStatusDto.builder()
                        .status(obj[0] != null ? obj[0].toString() : "UNKNOWN")
                        .count(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingTrendDto> getBookingTrend(LocalDateTime from, LocalDateTime to, String groupBy) {
        List<Object[]> results;
        if ("MONTHLY".equalsIgnoreCase(groupBy)) {
            results = bookingRepository.getBookingTrendMonthly(from, to);
        } else if ("YEARLY".equalsIgnoreCase(groupBy)) {
            results = bookingRepository.getBookingTrendYearly(from, to);
        } else {
            results = bookingRepository.getBookingTrendDaily(from, to);
        }

        return results.stream()
                .map(obj -> BookingTrendDto.builder()
                        .period(obj[0] != null ? obj[0].toString() : "")
                        .bookingCount(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public TicketSummaryDto getTicketSummary(LocalDateTime from, LocalDateTime to) {
        long sold = ticketRepository.countTicketsSoldBetween(from, to);
        long used = ticketRepository.countByStatusAndCreatedAtBetween(Ticket.TicketStatus.USED, from, to)
                + ticketRepository.countByStatusAndCreatedAtBetween(Ticket.TicketStatus.CHECKED_IN, from, to);
        double rate = sold > 0 ? (double) used / sold : 0.0;

        return TicketSummaryDto.builder()
                .totalTicketsSold(sold)
                .totalTicketsUsed(used)
                .checkInRate(rate)
                .build();
    }

    @Override
    public List<TicketSoldDto> getTicketSoldReport(LocalDateTime from, LocalDateTime to) {
        return ticketRepository.countTicketsSoldGroupedByType(from, to).stream()
                .map(obj -> TicketSoldDto.builder()
                        .ticketTypeName(obj[0] != null ? obj[0].toString() : "Unknown")
                        .soldCount(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketUsedDto> getTicketUsedReport(LocalDateTime from, LocalDateTime to) {
        return ticketRepository.countTicketsUsedGroupedByType(from, to).stream()
                .map(obj -> TicketUsedDto.builder()
                        .ticketTypeName(obj[0] != null ? obj[0].toString() : "Unknown")
                        .usedCount(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketCancelledDto> getTicketCancelledReport(LocalDateTime from, LocalDateTime to) {
        return ticketRepository.countTicketsCancelledGroupedByType(from, to).stream()
                .map(obj -> TicketCancelledDto.builder()
                        .ticketTypeName(obj[0] != null ? obj[0].toString() : "Unknown")
                        .cancelledCount(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public RideSummaryDto getRideSummary(LocalDateTime from, LocalDateTime to) {
        long totalRides = rideRepository.count();
        long totalValidations = ticketRepository.countTicketsSoldBetween(from, to); // proxy count or validations count
        Double avgWaiting = rideCapacityRepository.getAverageWaitingCount();

        return RideSummaryDto.builder()
                .totalRides(totalRides)
                .totalValidations(totalValidations)
                .averageWaitingMinutes(avgWaiting != null ? avgWaiting : 0.0)
                .build();
    }

    @Override
    public List<RidePopularityDto> getPopularRides(LocalDateTime from, LocalDateTime to, int limit, String direction) {
        List<PopularRideProjection> rides = rideRepository.getPopularRides(from, to);
        if ("ASC".equalsIgnoreCase(direction)) {
            // Sort ascending for least popular
            rides = new ArrayList<>(rides);
            rides.sort((r1, r2) -> Long.compare(r1.getValidationCount(), r2.getValidationCount()));
        }
        return rides.stream()
                .limit(limit)
                .map(p -> RidePopularityDto.builder().rideId(p.getRideId()).rideName(p.getRideName()).validationCount(p.getValidationCount()).build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RideCapacityDto> getRideCapacityReport(Long rideId, LocalDate date) {
        List<RideCapacity> capacities = rideId != null 
                ? rideCapacityRepository.findByRideId(rideId)
                : rideCapacityRepository.findAll();

        return capacities.stream()
                .map(rc -> RideCapacityDto.builder()
                        .rideId(rc.getRide().getId())
                        .rideName(rc.getRide().getName())
                        .timeSlot(rc.getTimeSlot() != null ? rc.getTimeSlot().toString() : "00:00")
                        .maxCapacity(rc.getMaxCapacity())
                        .bookedCount(rc.getBookedCount())
                        .currentWaitingCount(rc.getCurrentWaitingCount())
                        .occupancyRate(rc.getMaxCapacity() > 0 ? (double) rc.getBookedCount() / rc.getMaxCapacity() : 0.0)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RideWaitingTimeDto> getRideWaitingTimeReport(Long rideId) {
        if (rideId != null) {
            return rideRepository.getRideWaitingTime(rideId).stream()
                    .map(p -> RideWaitingTimeDto.builder()
                            .rideId(p.getRideId())
                            .rideName(p.getRideName())
                            .avgQueueLength(p.getAvgQueueLength())
                            .rideCapacity(p.getRideCapacity())
                            .cycleDuration(p.getCycleDuration())
                            .estimatedWaitMinutes(p.getEstimatedWaitMinutes())
                            .build())
                    .collect(Collectors.toList());
        } else {
            return rideRepository.getRideWaitingTimes().stream()
                    .map(p -> RideWaitingTimeDto.builder()
                            .rideId(p.getRideId())
                            .rideName(p.getRideName())
                            .avgQueueLength(p.getAvgQueueLength())
                            .rideCapacity(p.getRideCapacity())
                            .cycleDuration(p.getCycleDuration())
                            .estimatedWaitMinutes(p.getEstimatedWaitMinutes())
                            .build())
                    .collect(Collectors.toList());
        }
    }

    @Override
    public CustomerSummaryDto getCustomerSummary(LocalDateTime from, LocalDateTime to) {
        long total = customerRepository.count();
        long newCust = customerRepository.countByCreatedAtBetween(from, to);
        long returning = customerRepository.countReturningCustomers(from, to);
        double rate = total > 0 ? (double) returning / total : 0.0;

        return CustomerSummaryDto.builder()
                .totalCustomers(total)
                .newCustomersCount(newCust)
                .returningCustomersCount(returning)
                .returningRate(rate)
                .build();
    }

    @Override
    public List<CustomerRegistrationDto> getNewCustomerRegistrationTrend(LocalDateTime from, LocalDateTime to, String groupBy) {
        List<CustomerRegistrationProjection> results;
        if ("MONTHLY".equalsIgnoreCase(groupBy)) {
            results = customerRepository.getNewCustomersTrendMonthly(from, to);
        } else if ("YEARLY".equalsIgnoreCase(groupBy)) {
            results = customerRepository.getNewCustomersTrendYearly(from, to);
        } else {
            results = customerRepository.getNewCustomersTrendDaily(from, to);
        }

        return results.stream()
                .map(p -> CustomerRegistrationDto.builder()
                        .period(p.getPeriod())
                        .newCustomersCount(p.getNewCustomersCount())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public CustomerReturningDto getReturningCustomersReport(LocalDateTime from, LocalDateTime to) {
        long returning = customerRepository.countReturningCustomers(from, to);
        long active = customerRepository.countByCreatedAtBetween(from, to);

        return CustomerReturningDto.builder()
                .returningCustomersCount(returning)
                .totalActiveCustomers(active)
                .build();
    }

    @Override
    public List<CustomerMembershipDto> getMembershipDistribution() {
        return customerRepository.countCustomersByMembershipTier().stream()
                .map(obj -> CustomerMembershipDto.builder()
                        .tierName(obj[0] != null ? obj[0].toString() : "Unknown")
                        .memberCount(((Number) obj[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ParkingSummaryDto getParkingSummary(LocalDateTime from, LocalDateTime to) {
        long lots = parkingLotRepository.countByDeletedAtIsNull();
        int occupied = parkingLotRepository.sumOccupiedSpaces();
        int total = parkingLotRepository.sumTotalSpaces();
        double rate = total > 0 ? (double) occupied / total : 0.0;

        return ParkingSummaryDto.builder()
                .totalParkingLots(lots)
                .occupiedSpaces(occupied)
                .totalSpaces(total)
                .averageOccupancyRate(rate)
                .build();
    }

    @Override
    public List<ParkingOccupancyDto> getParkingOccupancyReport(Long lotId, LocalDateTime from, LocalDateTime to) {
        // Active occupancies
        return parkingLotRepository.findAll().stream()
                .filter(pl -> lotId == null || pl.getId().equals(lotId))
                .map(pl -> ParkingOccupancyDto.builder()
                        .parkingLotId(pl.getId())
                        .parkingLotName(pl.getName())
                        .occupiedSpaces(pl.getOccupiedSpaces())
                        .availableSpaces(Math.max(0, pl.getTotalSpaces() - pl.getOccupiedSpaces()))
                        .occupancyRate(pl.getTotalSpaces() > 0 ? (double) pl.getOccupiedSpaces() / pl.getTotalSpaces() : 0.0)
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<ParkingRevenueDto> getParkingRevenueReport(LocalDateTime from, LocalDateTime to) {
        return parkingTransactionRepository.getParkingOccupancyAndRevenueReport(from, to).stream()
                .map(p -> ParkingRevenueDto.builder()
                        .parkingLotId(p.getLotId())
                        .parkingLotName(p.getLotName())
                        .totalParkingFee(p.getTotalParkingFee())
                        .totalSessions(p.getTotalSessions())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public RetailSummaryDto getRetailSummary(LocalDateTime from, LocalDateTime to) {
        long shops = retailShopRepository.count();
        BigDecimal totalSales = orderRepository.sumOrderItemPriceByTypeAndDateRange("RETAIL", from, to)
                .add(orderRepository.sumOrderItemPriceByTypeAndDateRange("FOOD", from, to));
        long itemsSold = orderItemRepository.countItemsSoldBetween(from, to);

        return RetailSummaryDto.builder()
                .totalShops(shops)
                .totalSales(totalSales)
                .totalItemsSold(itemsSold)
                .build();
    }

    @Override
    public List<RetailSalesDto> getRetailSalesReport(LocalDateTime from, LocalDateTime to, String groupBy) {
        // Daily revenue trend filtered by retail items is mapped to daily revenue
        return orderRepository.getDailyRevenueTrend(from, to).stream()
                .map(p -> RetailSalesDto.builder()
                        .period(p.getPeriod())
                        .totalSales(p.getTotalRevenue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RetailProductsDto> getPopularProductsReport(LocalDateTime from, LocalDateTime to, int limit) {
        return orderItemRepository.getProductSalesReport(from, to).stream()
                .limit(limit)
                .map(p -> RetailProductsDto.builder()
                        .itemId(p.getItemId())
                        .itemName(p.getItemName() != null ? p.getItemName() : "Product #" + p.getItemId())
                        .totalQuantitySold(p.getTotalQuantitySold())
                        .totalRevenue(p.getTotalRevenue())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public PromotionSummaryDto getPromotionSummary(LocalDateTime from, LocalDateTime to) {
        long campaigns = campaignRepository.count();
        long couponsUsed = couponUsageRepository.countUsagesBetween(from, to);
        // Assume total discount sum
        BigDecimal discountGiven = couponUsageRepository.getCouponPerformanceReport(from, to).stream()
                .map(CouponPerformanceProjection::getTotalDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PromotionSummaryDto.builder()
                .totalCampaigns(campaigns)
                .totalCouponsUsed(couponsUsed)
                .totalDiscountGiven(discountGiven)
                .build();
    }

    @Override
    public List<CouponPerformanceDto> getCouponUsagesReport(Long campaignId, LocalDateTime from, LocalDateTime to) {
        return couponUsageRepository.getCouponPerformanceReport(from, to).stream()
                .map(p -> CouponPerformanceDto.builder()
                        .couponId(p.getCouponId())
                        .couponCode(p.getCouponCode())
                        .totalUses(p.getTotalUses())
                        .totalDiscountAmount(p.getTotalDiscountAmount())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public VoucherSummaryDto getVoucherUsagesReport(LocalDateTime from, LocalDateTime to) {
        long count = voucherRepository.count();
        BigDecimal issuedVal = voucherRepository.sumVoucherValueIssued(from, to);
        BigDecimal spentVal = voucherUsageRepository.sumAmountUsedBetween(from, to);

        return VoucherSummaryDto.builder()
                .totalVouchersIssued(count)
                .totalVoucherBalance(issuedVal.subtract(spentVal))
                .totalVoucherSpent(spentVal)
                .build();
    }
}
