package com.gateos.module.dashboard.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.checkin.repository.CheckInRepository;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.ticket.repository.TicketRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Tag(name = "Dashboard & Analytics", description = "Báo cáo doanh thu và thống kê vận hành")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final CheckInRepository checkInRepository;
    private final TicketRepository ticketRepository;

    @Operation(summary = "Tóm tắt Dashboard ngày hôm nay")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        BigDecimal todayRevenue = orderRepository.sumRevenueBetween(startOfDay, endOfDay);
        long todayOrders = orderRepository.countPaidBetween(startOfDay, endOfDay);
        long todayCheckIns = checkInRepository.countSuccessBetween(startOfDay, endOfDay);

        Map<String, Object> summary = new HashMap<>();
        summary.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        summary.put("todayOrders", todayOrders);
        summary.put("todayCheckIns", todayCheckIns);
        summary.put("date", LocalDate.now().toString());

        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @Operation(summary = "Báo cáo doanh thu theo khoảng thời gian")
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);

        BigDecimal revenue = orderRepository.sumRevenueBetween(fromDt, toDt);
        long orderCount = orderRepository.countPaidBetween(fromDt, toDt);

        Map<String, Object> data = Map.of(
                "totalRevenue", revenue != null ? revenue : BigDecimal.ZERO,
                "orderCount", orderCount,
                "from", from.toString(),
                "to", to.toString()
        );
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(summary = "Thống kê lượt check-in")
    @GetMapping("/check-in")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCheckInStats(
            @RequestParam(defaultValue = "TODAY") String period) {
        LocalDateTime from, to;
        to = LocalDateTime.now();
        from = switch (period.toUpperCase()) {
            case "WEEK" -> to.minusDays(7);
            case "MONTH" -> to.minusDays(30);
            default -> LocalDate.now().atStartOfDay();
        };

        long count = checkInRepository.countSuccessBetween(from, to);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("checkInCount", count, "period", period)));
    }

    @Operation(summary = "Thống kê tổng số vé đã bán")
    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTicketStats() {
        long totalTickets = ticketRepository.count();
        long usedTickets = ticketRepository.countByCustomerIdAndStatus(0L, com.gateos.module.ticket.entity.Ticket.TicketStatus.USED);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "totalTickets", totalTickets,
                "usedTickets", usedTickets
        )));
    }
}
