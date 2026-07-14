package com.smartpark.domain.bi.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.entity.ReportHistory;
import com.smartpark.domain.bi.entity.ReportHistory.ReportStatus;
import com.smartpark.domain.bi.entity.ReportSchedule;
import com.smartpark.domain.bi.repository.ReportHistoryRepository;
import com.smartpark.domain.bi.repository.ReportScheduleRepository;
import com.smartpark.domain.bi.service.ReportService;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.incident.repository.IncidentRepository;
import com.smartpark.domain.order.repository.OrderItemRepository;
import com.smartpark.domain.order.repository.OrderRepository;
import com.smartpark.domain.parking.repository.ParkingLotRepository;
import com.smartpark.domain.parking.repository.ParkingTransactionRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.VoucherRepository;
import com.smartpark.domain.promotion.repository.VoucherUsageRepository;
import com.smartpark.domain.retail.repository.RetailShopRepository;
import com.smartpark.domain.ride.repository.RideCapacityRepository;
import com.smartpark.domain.ride.repository.RideRepository;
import com.smartpark.domain.support.repository.SupportTicketRepository;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final ReportScheduleRepository reportScheduleRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final RideRepository rideRepository;
    private final RideCapacityRepository rideCapacityRepository;
    private final CustomerRepository customerRepository;
    private final ParkingLotRepository parkingLotRepository;
    private final ParkingTransactionRepository parkingTransactionRepository;
    private final RetailShopRepository retailShopRepository;
    private final OrderItemRepository orderItemRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final EmployeeRepository employeeRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final IncidentRepository incidentRepository;
    private final ObjectMapper objectMapper;

    private static final List<ReportConfigResponse> REPORT_CONFIGS = Arrays.asList(
            new ReportConfigResponse("REVENUE", "Revenue Report", "Summarizes total sales and payment transactions.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "paymentMethod")),
            new ReportConfigResponse("TICKET", "Ticket Report", "Report of tickets sold, checked in, and cancelled.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "ticketType")),
            new ReportConfigResponse("BOOKING", "Booking Report", "Status of online bookings and customer conversions.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "bookingStatus")),
            new ReportConfigResponse("ORDER", "Order Report", "Report on all itemized customer purchases.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "orderStatus")),
            new ReportConfigResponse("PAYMENT", "Payment Report", "Breakdown of payment gateways and transaction status.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "paymentMethod")),
            new ReportConfigResponse("RIDE", "Ride Report", "Visitor validations and wait times across park rides.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "ride")),
            new ReportConfigResponse("PARKING", "Parking Report", "Parking spaces occupancy and collection report.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "park")),
            new ReportConfigResponse("MEMBERSHIP", "Membership Report", "Tier distribution and membership signups.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "membership")),
            new ReportConfigResponse("PROMOTION", "Promotion Report", "Performance analysis of coupon codes and campaigns.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange", "promotion")),
            new ReportConfigResponse("RETAIL", "Retail Report", "Inventory sales and item revenue report.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange")),
            new ReportConfigResponse("FOOD_COURT", "Food Court Report", "Food and beverage item sales performance report.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange")),
            new ReportConfigResponse("CUSTOMER", "Customer Report", "Customer signup trends and demographic overview.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange")),
            new ReportConfigResponse("EMPLOYEE", "Employee Report", "Staff listings, roles, and status report.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("department", "employee")),
            new ReportConfigResponse("SUPPORT", "Support Report", "Customer complaints and customer service ticket summaries.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange")),
            new ReportConfigResponse("INCIDENT", "Incident Report", "Security and park safety incidents logging report.", Arrays.asList("EXCEL", "PDF", "CSV"), Arrays.asList("dateRange"))
    );

    @Override
    public List<ReportConfigResponse> getReports() {
        return REPORT_CONFIGS;
    }

    @Override
    public ReportConfigResponse getReportById(String reportType) {
        return REPORT_CONFIGS.stream()
                .filter(r -> r.getReportType().equalsIgnoreCase(reportType))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Report configuration not found for: " + reportType));
    }

    @Override
    @Transactional
    public ReportHistoryResponse generateReport(ReportGenerateRequest request) {
        ReportHistory history = ReportHistory.builder()
                .reportType(request.getReportType())
                .generatedAt(LocalDateTime.now())
                .status(ReportStatus.PENDING)
                .filtersUsed(serializeFilters(request.getFilters()))
                .build();
        
        reportHistoryRepository.save(history);
        
        // Trigger async execution
        processAsyncReport(history.getId());

        return toHistoryResponse(history);
    }

    @Async
    @Transactional
    public void processAsyncReport(Long historyId) {
        ReportHistory history = reportHistoryRepository.findById(historyId).orElse(null);
        if (history == null) return;

        try {
            history.setStatus(ReportStatus.RUNNING);
            reportHistoryRepository.saveAndFlush(history);

            // Simulate parsing and generating report to path
            Thread.sleep(100); 

            history.setStatus(ReportStatus.COMPLETED);
            history.setFilePath("/var/reports/generated_" + historyId + ".xlsx");
            history.setDownloadUrl("/api/v1/reports/download/" + historyId);
            history.setExpiresAt(LocalDateTime.now().plusDays(7));
            history.setFileSize(2048L);
        } catch (Exception e) {
            history.setStatus(ReportStatus.FAILED);
            history.setErrorMessage(e.getMessage());
        }
        reportHistoryRepository.save(history);
    }

    @Override
    public ReportPreviewResponse previewReport(ReportPreviewRequest request) {
        LocalDateTime from = parseDate(request.getFilters() != null ? request.getFilters().get("startDate") : null, LocalDateTime.now().minusDays(30));
        LocalDateTime to = parseDate(request.getFilters() != null ? request.getFilters().get("endDate") : null, LocalDateTime.now());

        List<String> headers = new ArrayList<>();
        List<Map<String, Object>> data = new ArrayList<>();

        switch (request.getReportType().toUpperCase()) {
            case "REVENUE":
                headers = Arrays.asList("Period", "Total Revenue", "Transaction Count");
                data = orderRepository.getDailyRevenueTrend(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Period", p.getPeriod());
                    m.put("Total Revenue", p.getTotalRevenue());
                    m.put("Transaction Count", p.getTxCount());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "TICKET":
                headers = Arrays.asList("Ticket Type Name", "Sold Count");
                data = ticketRepository.countTicketsSoldGroupedByType(from, to).stream().map(obj -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Ticket Type Name", obj[0]);
                    m.put("Sold Count", obj[1]);
                    return m;
                }).collect(Collectors.toList());
                break;
            case "BOOKING":
                headers = Arrays.asList("Booking Status", "Count");
                data = bookingRepository.countBookingsByStatusInRange(from, to).stream().map(obj -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Booking Status", obj[0]);
                    m.put("Count", obj[1]);
                    return m;
                }).collect(Collectors.toList());
                break;
            case "ORDER":
                headers = Arrays.asList("Period", "Total Sales", "Orders Count");
                data = orderRepository.getDailyRevenueTrend(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Period", p.getPeriod());
                    m.put("Total Sales", p.getTotalRevenue());
                    m.put("Orders Count", p.getTxCount());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "PAYMENT":
                headers = Arrays.asList("Payment Method", "Revenue");
                data = orderRepository.getRevenueByPaymentMethod(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Payment Method", p.getTicketCategory());
                    m.put("Revenue", p.getRevenue());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "RIDE":
                headers = Arrays.asList("Ride ID", "Ride Name", "Validation Count");
                data = rideRepository.getPopularRides(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Ride ID", p.getRideId());
                    m.put("Ride Name", p.getRideName());
                    m.put("Validation Count", p.getValidationCount());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "PARKING":
                headers = Arrays.asList("Parking Lot ID", "Parking Lot Name", "Total Parking Fee", "Total Sessions");
                data = parkingTransactionRepository.getParkingOccupancyAndRevenueReport(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Parking Lot ID", p.getLotId());
                    m.put("Parking Lot Name", p.getLotName());
                    m.put("Total Parking Fee", p.getTotalParkingFee());
                    m.put("Total Sessions", p.getTotalSessions());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "MEMBERSHIP":
                headers = Arrays.asList("Membership Tier", "Member Count");
                data = customerRepository.countCustomersByMembershipTier().stream().map(obj -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Membership Tier", obj[0]);
                    m.put("Member Count", obj[1]);
                    return m;
                }).collect(Collectors.toList());
                break;
            case "PROMOTION":
                headers = Arrays.asList("Coupon ID", "Coupon Code", "Total Uses", "Total Discount Amount");
                data = couponUsageRepository.getCouponPerformanceReport(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Coupon ID", p.getCouponId());
                    m.put("Coupon Code", p.getCouponCode());
                    m.put("Total Uses", p.getTotalUses());
                    m.put("Total Discount Amount", p.getTotalDiscountAmount());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "RETAIL":
            case "FOOD_COURT":
                headers = Arrays.asList("Item ID", "Item Name", "Total Quantity Sold", "Total Revenue");
                data = orderItemRepository.getProductSalesReport(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Item ID", p.getItemId());
                    m.put("Item Name", p.getItemName());
                    m.put("Total Quantity Sold", p.getTotalQuantitySold());
                    m.put("Total Revenue", p.getTotalRevenue());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "CUSTOMER":
                headers = Arrays.asList("Period", "New Customers Count");
                data = customerRepository.getNewCustomersTrendDaily(from, to).stream().map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Period", p.getPeriod());
                    m.put("New Customers Count", p.getNewCustomersCount());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "EMPLOYEE":
                headers = Arrays.asList("Employee ID", "Full Name", "Email", "Phone", "Status");
                data = employeeRepository.findAll().stream().map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Employee ID", e.getId());
                    m.put("Full Name", e.getFullName());
                    m.put("Email", e.getEmail());
                    m.put("Phone", e.getPhone());
                    m.put("Status", e.getStatus().name());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "SUPPORT":
                headers = Arrays.asList("Ticket ID", "Ticket Number", "Subject", "Status", "Priority");
                data = supportTicketRepository.findAll().stream().map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Ticket ID", s.getId());
                    m.put("Ticket Number", s.getTicketNumber());
                    m.put("Subject", s.getSubject());
                    m.put("Status", s.getStatus().name());
                    m.put("Priority", s.getPriority().name());
                    return m;
                }).collect(Collectors.toList());
                break;
            case "INCIDENT":
                headers = Arrays.asList("Incident ID", "Incident Number", "Severity", "Status", "Description");
                data = incidentRepository.findAll().stream().map(i -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("Incident ID", i.getId());
                    m.put("Incident Number", i.getIncidentNumber());
                    m.put("Severity", i.getSeverity().name());
                    m.put("Status", i.getStatus().name());
                    m.put("Description", i.getDescription());
                    return m;
                }).collect(Collectors.toList());
                break;
            default:
                break;
        }

        return ReportPreviewResponse.builder()
                .headers(headers)
                .data(data)
                .build();
    }

    @Override
    public List<ReportHistoryResponse> getReportHistory() {
        return reportHistoryRepository.findAll().stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReportHistory(Long id) {
        reportHistoryRepository.deleteById(id);
    }

    @Override
    public List<ReportScheduleResponse> getSchedules() {
        return reportScheduleRepository.findAll().stream()
                .map(this::toScheduleResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReportScheduleResponse getScheduleById(Long id) {
        ReportSchedule sc = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        return toScheduleResponse(sc);
    }

    @Override
    @Transactional
    public ReportScheduleResponse createSchedule(ReportScheduleRequest request) {
        ReportSchedule sc = ReportSchedule.builder()
                .reportType(request.getReportType())
                .cronExpression(request.getCronExpression())
                .exportFormat(request.getExportFormat())
                .emailRecipients(request.getEmailRecipients())
                .enabled(request.isEnabled())
                .filters(serializeFilters(request.getFilters()))
                .build();
        reportScheduleRepository.save(sc);
        return toScheduleResponse(sc);
    }

    @Override
    @Transactional
    public ReportScheduleResponse updateSchedule(Long id, ReportScheduleRequest request) {
        ReportSchedule sc = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        
        sc.setReportType(request.getReportType());
        sc.setCronExpression(request.getCronExpression());
        sc.setExportFormat(request.getExportFormat());
        sc.setEmailRecipients(request.getEmailRecipients());
        sc.setEnabled(request.isEnabled());
        sc.setFilters(serializeFilters(request.getFilters()));
        
        reportScheduleRepository.save(sc);
        return toScheduleResponse(sc);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        reportScheduleRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ReportScheduleResponse enableSchedule(Long id) {
        ReportSchedule sc = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        sc.setEnabled(true);
        reportScheduleRepository.save(sc);
        return toScheduleResponse(sc);
    }

    @Override
    @Transactional
    public ReportScheduleResponse disableSchedule(Long id) {
        ReportSchedule sc = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        sc.setEnabled(false);
        reportScheduleRepository.save(sc);
        return toScheduleResponse(sc);
    }

    @Override
    @Transactional
    public void runScheduleImmediately(Long id) {
        ReportSchedule sc = reportScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        
        // Trigger report generation immediately
        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType(sc.getReportType())
                .exportFormat(sc.getExportFormat())
                .filters(deserializeFilters(sc.getFilters()))
                .build();
        generateReport(req);
    }

    private LocalDateTime parseDate(Object obj, LocalDateTime defaultVal) {
        if (obj == null) return defaultVal;
        try {
            return LocalDateTime.parse(obj.toString());
        } catch (Exception e) {
            try {
                return LocalDate.parse(obj.toString()).atStartOfDay();
            } catch (Exception ex) {
                return defaultVal;
            }
        }
    }

    private String serializeFilters(Map<String, Object> filters) {
        if (filters == null) return "{}";
        try {
            return objectMapper.writeValueAsString(filters);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Map<String, Object> deserializeFilters(String json) {
        if (json == null || json.isEmpty()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private ReportHistoryResponse toHistoryResponse(ReportHistory h) {
        return ReportHistoryResponse.builder()
                .id(h.getId())
                .reportType(h.getReportType())
                .generatedAt(h.getGeneratedAt())
                .generatedBy(h.getGeneratedBy())
                .status(h.getStatus().name())
                .filtersUsed(h.getFiltersUsed())
                .fileSize(h.getFileSize())
                .downloadUrl(h.getDownloadUrl())
                .expiresAt(h.getExpiresAt())
                .errorMessage(h.getErrorMessage())
                .build();
    }

    private ReportScheduleResponse toScheduleResponse(ReportSchedule sc) {
        return ReportScheduleResponse.builder()
                .id(sc.getId())
                .reportType(sc.getReportType())
                .cronExpression(sc.getCronExpression())
                .exportFormat(sc.getExportFormat())
                .emailRecipients(sc.getEmailRecipients())
                .enabled(sc.isEnabled())
                .filters(sc.getFilters())
                .createdAt(sc.getCreatedAt())
                .updatedAt(sc.getUpdatedAt())
                .createdBy(sc.getCreatedBy())
                .build();
    }
}
