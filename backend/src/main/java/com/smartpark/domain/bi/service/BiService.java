package com.smartpark.domain.bi.service;

import com.smartpark.domain.bi.dto.BiDto;
import com.smartpark.domain.bi.repository.AnalyticsEventRepository;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BiService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final BookingRepository bookingRepository;

    // ─────────────────── REVENUE METRICS ───────────────────

    @Transactional(readOnly = true)
    public BiDto.RevenueResponse getDailyRevenue(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to   = date.plusDays(1).atStartOfDay();

        Double raw = analyticsEventRepository.sumRevenueByDateRange(from, to);
        BigDecimal total = raw != null ? BigDecimal.valueOf(raw) : BigDecimal.ZERO;

        return BiDto.RevenueResponse.builder()
                .totalRevenue(total)
                .period(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build();
    }

    @Transactional(readOnly = true)
    public BiDto.RevenueResponse getMonthlyRevenue(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to   = ym.atEndOfMonth().plusDays(1).atStartOfDay();

        Double raw = analyticsEventRepository.sumRevenueByDateRange(from, to);
        BigDecimal total = raw != null ? BigDecimal.valueOf(raw) : BigDecimal.ZERO;

        return BiDto.RevenueResponse.builder()
                .totalRevenue(total)
                .period(year + "-" + String.format("%02d", month))
                .build();
    }

    @Transactional(readOnly = true)
    public List<BiDto.RevenueByTypeItem> getRevenueByTicketType(LocalDate from, LocalDate to) {
        List<Object[]> rows = analyticsEventRepository.revenueByResourceInRange(
                from.atStartOfDay(), to.plusDays(1).atStartOfDay());

        List<BiDto.RevenueByTypeItem> result = new ArrayList<>();
        for (Object[] row : rows) {
            String meta = row[0] != null ? row[0].toString() : "Unknown";
            Double rev  = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            result.add(BiDto.RevenueByTypeItem.builder()
                    .ticketType(meta)
                    .revenue(BigDecimal.valueOf(rev))
                    .build());
        }
        return result;
    }

    // ─────────────────── VISITOR / CHECK-IN METRICS ─────────────────

    @Transactional(readOnly = true)
    public BiDto.VisitorResponse getDailyVisitors(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to   = date.plusDays(1).atStartOfDay();

        Long count = analyticsEventRepository.countCheckInsByDateRange(from, to);
        return BiDto.VisitorResponse.builder()
                .visitorCount(count != null ? count : 0L)
                .period(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                .build();
    }

    // ─────────────────── OPERATION METRICS ───────────────────────────

    @Transactional(readOnly = true)
    public List<BiDto.PeakHourItem> getPeakHours(LocalDate date) {
        List<Object[]> rows = analyticsEventRepository.visitorsByHour(
                date.atStartOfDay(), date.plusDays(1).atStartOfDay());

        List<BiDto.PeakHourItem> result = new ArrayList<>();
        for (Object[] row : rows) {
            int hour  = ((Number) row[0]).intValue();
            long cnt  = ((Number) row[1]).longValue();
            result.add(BiDto.PeakHourItem.builder().hour(hour).visitorCount(cnt).build());
        }
        return result;
    }

    // ─────────────────── CUSTOMER ANALYTICS ──────────────────────────

    @Transactional(readOnly = true)
    public List<BiDto.TopSpenderItem> getTopSpenders(int limit) {
        List<Object[]> rows = analyticsEventRepository.topSpenders(limit);

        List<BiDto.TopSpenderItem> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long userId       = row[0] != null ? ((Number) row[0]).longValue() : null;
            Double spent      = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            Long txCount      = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            result.add(BiDto.TopSpenderItem.builder()
                    .customerId(userId)
                    .totalSpent(BigDecimal.valueOf(spent))
                    .transactions(txCount)
                    .build());
        }
        return result;
    }

    // ─────────────────── DASHBOARD SUMMARY ───────────────────────────

    @Transactional(readOnly = true)
    public BiDto.DashboardSummary getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.atStartOfDay();
        LocalDateTime to   = today.plusDays(1).atStartOfDay();

        Double revenueRaw = analyticsEventRepository.sumRevenueByDateRange(from, to);
        BigDecimal todayRevenue = revenueRaw != null ? BigDecimal.valueOf(revenueRaw) : BigDecimal.ZERO;

        Long visitors = analyticsEventRepository.countCheckInsByDateRange(from, to);

        long pendingBookings = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);

        List<BiDto.PeakHourItem> peakHours = getPeakHours(today);

        return BiDto.DashboardSummary.builder()
                .todayRevenue(todayRevenue)
                .todayVisitors(visitors != null ? visitors : 0L)
                .pendingBookings(pendingBookings)
                .activeRides(0L) // Placeholder — wire RideRepository if needed
                .peakHoursToday(peakHours)
                .build();
    }
}
