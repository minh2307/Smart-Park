package com.smartpark.domain.bi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsDto {

    @Data @Builder
    public static class DashboardSummaryDto {
        private BigDecimal totalRevenue;
        private BigDecimal todayRevenue;
        private long activeVisitors;
        private int currentParkingOccupied;
        private int currentParkingAvailable;
        private double averageRideUtilization;
        private long ticketsSoldToday;
        private long membershipGrowthToday;
    }

    @Data @Builder
    public static class OverviewAnalyticsDto {
        private List<OverviewTrendItem> trends;
    }

    @Data @Builder
    public static class OverviewTrendItem {
        private String date;
        private BigDecimal revenue;
        private long visitors;
    }

    @Data @Builder
    public static class KpiResponseDto {
        private BigDecimal averageOrderValue;
        private double conversionRate;
        private long totalActiveMembers;
        private double memberChurnRate;
        private BigDecimal revenuePerVisitor;
    }

    @Data @Builder
    public static class RevenueTrendDto {
        private String period;
        private BigDecimal totalRevenue;
        private long transactionCount;
    }

    @Data @Builder
    public static class RevenueByTypeDto {
        private String ticketCategory;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class RevenueByPaymentDto {
        private String methodName;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class BookingSummaryDto {
        private long totalBookings;
        private long completedBookings;
        private BigDecimal totalAmount;
        private double paymentSuccessRate;
    }

    @Data @Builder
    public static class BookingStatusDto {
        private String status;
        private long count;
    }

    @Data @Builder
    public static class BookingTrendDto {
        private String period;
        private long bookingCount;
    }

    @Data @Builder
    public static class TicketSummaryDto {
        private long totalTicketsSold;
        private long totalTicketsUsed;
        private double checkInRate;
    }

    @Data @Builder
    public static class TicketSoldDto {
        private String ticketTypeName;
        private long soldCount;
    }

    @Data @Builder
    public static class TicketUsedDto {
        private String ticketTypeName;
        private long usedCount;
    }

    @Data @Builder
    public static class TicketCancelledDto {
        private String ticketTypeName;
        private long cancelledCount;
    }

    @Data @Builder
    public static class RideSummaryDto {
        private long totalRides;
        private long totalValidations;
        private double averageWaitingMinutes;
    }

    @Data @Builder
    public static class RidePopularityDto {
        private Long rideId;
        private String rideName;
        private long validationCount;
    }

    @Data @Builder
    public static class RideCapacityDto {
        private Long rideId;
        private String rideName;
        private String timeSlot;
        private int maxCapacity;
        private int bookedCount;
        private int currentWaitingCount;
        private double occupancyRate;
    }

    @Data @Builder
    public static class RideWaitingTimeDto {
        private Long rideId;
        private String rideName;
        private double avgQueueLength;
        private int rideCapacity;
        private int cycleDuration;
        private double estimatedWaitMinutes;
    }

    @Data @Builder
    public static class CustomerSummaryDto {
        private long totalCustomers;
        private long newCustomersCount;
        private long returningCustomersCount;
        private double returningRate;
    }

    @Data @Builder
    public static class CustomerRegistrationDto {
        private String period;
        private long newCustomersCount;
    }

    @Data @Builder
    public static class CustomerReturningDto {
        private long returningCustomersCount;
        private long totalActiveCustomers;
    }

    @Data @Builder
    public static class CustomerMembershipDto {
        private String tierName;
        private long memberCount;
    }

    @Data @Builder
    public static class ParkingSummaryDto {
        private long totalParkingLots;
        private int occupiedSpaces;
        private int totalSpaces;
        private double averageOccupancyRate;
    }

    @Data @Builder
    public static class ParkingOccupancyDto {
        private Long parkingLotId;
        private String parkingLotName;
        private double occupancyRate;
        private int occupiedSpaces;
        private int availableSpaces;
    }

    @Data @Builder
    public static class ParkingRevenueDto {
        private Long parkingLotId;
        private String parkingLotName;
        private BigDecimal totalParkingFee;
        private long totalSessions;
    }

    @Data @Builder
    public static class RetailSummaryDto {
        private long totalShops;
        private BigDecimal totalSales;
        private long totalItemsSold;
    }

    @Data @Builder
    public static class RetailSalesDto {
        private String period;
        private BigDecimal totalSales;
    }

    @Data @Builder
    public static class RetailProductsDto {
        private Long itemId;
        private String itemName;
        private long totalQuantitySold;
        private BigDecimal totalRevenue;
    }

    @Data @Builder
    public static class PromotionSummaryDto {
        private long totalCampaigns;
        private long totalCouponsUsed;
        private BigDecimal totalDiscountGiven;
    }

    @Data @Builder
    public static class CouponPerformanceDto {
        private Long couponId;
        private String couponCode;
        private long totalUses;
        private BigDecimal totalDiscountAmount;
    }

    @Data @Builder
    public static class VoucherSummaryDto {
        private long totalVouchersIssued;
        private BigDecimal totalVoucherBalance;
        private BigDecimal totalVoucherSpent;
    }
}
