package com.smartpark.domain.bi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.bi.dto.ReportsDto.*;
import com.smartpark.domain.bi.entity.ReportHistory;
import com.smartpark.domain.bi.entity.ReportSchedule;
import com.smartpark.domain.bi.projection.*;
import com.smartpark.domain.bi.repository.ReportHistoryRepository;
import com.smartpark.domain.bi.repository.ReportScheduleRepository;
import com.smartpark.domain.bi.service.impl.ReportServiceImpl;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.employee.entity.Employee;
import com.smartpark.domain.employee.repository.EmployeeRepository;
import com.smartpark.domain.incident.entity.Incident;
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
import com.smartpark.domain.support.entity.SupportTicket;
import com.smartpark.domain.support.repository.SupportTicketRepository;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock private ReportScheduleRepository reportScheduleRepository;
    @Mock private ReportHistoryRepository reportHistoryRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private BookingRepository bookingRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private CheckInRepository checkInRepository;
    @Mock private RideRepository rideRepository;
    @Mock private RideCapacityRepository rideCapacityRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ParkingLotRepository parkingLotRepository;
    @Mock private ParkingTransactionRepository parkingTransactionRepository;
    @Mock private RetailShopRepository retailShopRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private VoucherRepository voucherRepository;
    @Mock private VoucherUsageRepository voucherUsageRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private SupportTicketRepository supportTicketRepository;
    @Mock private IncidentRepository incidentRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    void testGetReports() {
        List<ReportConfigResponse> list = reportService.getReports();
        assertEquals(15, list.size());
    }

    @Test
    void testGetReportById() {
        ReportConfigResponse cfg = reportService.getReportById("REVENUE");
        assertEquals("REVENUE", cfg.getReportType());
    }

    @Test
    void testGetReportByIdNotFound() {
        assertThrows(RuntimeException.class, () -> reportService.getReportById("NON_EXIST"));
    }

    @Test
    void testGenerateReport() {
        when(reportHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportGenerateRequest req = ReportGenerateRequest.builder()
                .reportType("REVENUE")
                .exportFormat("EXCEL")
                .filters(new HashMap<>())
                .build();

        ReportHistoryResponse resp = reportService.generateReport(req);
        assertNotNull(resp);
        assertEquals("REVENUE", resp.getReportType());
    }

    @Test
    void testProcessAsyncReport() {
        ReportHistory h = ReportHistory.builder()
                .id(1L)
                .reportType("REVENUE")
                .status(ReportHistory.ReportStatus.PENDING)
                .build();

        when(reportHistoryRepository.findById(1L)).thenReturn(Optional.of(h));

        reportService.processAsyncReport(1L);

        assertEquals(ReportHistory.ReportStatus.COMPLETED, h.getStatus());
        assertNotNull(h.getFilePath());
    }

    @Test
    void testProcessAsyncReportNotFound() {
        when(reportHistoryRepository.findById(999L)).thenReturn(Optional.empty());
        reportService.processAsyncReport(999L);
        verify(reportHistoryRepository, never()).saveAndFlush(any());
    }

    @Test
    void testPreviewReportRevenue() {
        DailyRevenueProjection proj = new DailyRevenueProjection() {
            @Override public String getPeriod() { return "2026-07-10"; }
            @Override public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(100); }
            @Override public Long getTxCount() { return 5L; }
        };
        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("REVENUE").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals(3, resp.getHeaders().size());
        assertEquals("2026-07-10", resp.getData().get(0).get("Period"));
    }

    @Test
    void testPreviewReportTicket() {
        when(ticketRepository.countTicketsSoldGroupedByType(any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{"Adult VIP", 10L}));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("TICKET").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("Adult VIP", resp.getData().get(0).get("Ticket Type Name"));
    }

    @Test
    void testPreviewReportBooking() {
        when(bookingRepository.countBookingsByStatusInRange(any(), any()))
                .thenReturn(Collections.singletonList(new Object[]{"PAID", 150L}));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("BOOKING").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals(150L, resp.getData().get(0).get("Count"));
    }

    @Test
    void testPreviewReportOrder() {
        DailyRevenueProjection proj = new DailyRevenueProjection() {
            @Override public String getPeriod() { return "2026-07-10"; }
            @Override public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(100); }
            @Override public Long getTxCount() { return 5L; }
        };
        when(orderRepository.getDailyRevenueTrend(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("ORDER").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("2026-07-10", resp.getData().get(0).get("Period"));
    }

    @Test
    void testPreviewReportPayment() {
        RevenueByTypeProjection proj = new RevenueByTypeProjection() {
            @Override public String getTicketCategory() { return "PAYOS"; }
            @Override public BigDecimal getRevenue() { return BigDecimal.valueOf(250); }
        };
        when(orderRepository.getRevenueByPaymentMethod(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("PAYMENT").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("PAYOS", resp.getData().get(0).get("Payment Method"));
    }

    @Test
    void testPreviewReportRide() {
        PopularRideProjection proj = new PopularRideProjection() {
            @Override public Long getRideId() { return 1L; }
            @Override public String getRideName() { return "Coaster"; }
            @Override public Long getValidationCount() { return 120L; }
        };
        when(rideRepository.getPopularRides(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("RIDE").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("Coaster", resp.getData().get(0).get("Ride Name"));
    }

    @Test
    void testPreviewReportParking() {
        ParkingOccupancyProjection proj = new ParkingOccupancyProjection() {
            @Override public Long getLotId() { return 2L; }
            @Override public String getLotName() { return "North Lot"; }
            @Override public BigDecimal getTotalParkingFee() { return BigDecimal.valueOf(80); }
            @Override public Long getTotalSessions() { return 10L; }
        };
        when(parkingTransactionRepository.getParkingOccupancyAndRevenueReport(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("PARKING").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("North Lot", resp.getData().get(0).get("Parking Lot Name"));
    }

    @Test
    void testPreviewReportMembership() {
        when(customerRepository.countCustomersByMembershipTier())
                .thenReturn(Collections.singletonList(new Object[]{"GOLD", 25L}));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("MEMBERSHIP").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals(25L, resp.getData().get(0).get("Member Count"));
    }

    @Test
    void testPreviewReportPromotion() {
        CouponPerformanceProjection proj = new CouponPerformanceProjection() {
            @Override public Long getCouponId() { return 1L; }
            @Override public String getCouponCode() { return "PROMO"; }
            @Override public Long getTotalUses() { return 4L; }
            @Override public BigDecimal getTotalDiscountAmount() { return BigDecimal.valueOf(40); }
        };
        when(couponUsageRepository.getCouponPerformanceReport(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("PROMOTION").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("PROMO", resp.getData().get(0).get("Coupon Code"));
    }

    @Test
    void testPreviewReportRetail() {
        ProductSalesReportProjection proj = new ProductSalesReportProjection() {
            @Override public Long getItemId() { return 3L; }
            @Override public String getItemName() { return "Bear"; }
            @Override public Long getTotalQuantitySold() { return 5L; }
            @Override public BigDecimal getTotalRevenue() { return BigDecimal.valueOf(25); }
        };
        when(orderItemRepository.getProductSalesReport(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("RETAIL").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("Bear", resp.getData().get(0).get("Item Name"));
    }

    @Test
    void testPreviewReportCustomer() {
        CustomerRegistrationProjection proj = new CustomerRegistrationProjection() {
            @Override public String getPeriod() { return "2026-07-10"; }
            @Override public Long getNewCustomersCount() { return 8L; }
        };
        when(customerRepository.getNewCustomersTrendDaily(any(), any())).thenReturn(Collections.singletonList(proj));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("CUSTOMER").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals(8L, resp.getData().get(0).get("New Customers Count"));
    }

    @Test
    void testPreviewReportEmployee() {
        Employee e = Employee.builder().fullName("Son Minh").email("minh@smartpark.com").status(Employee.EmployeeStatus.ACTIVE).build();
        when(employeeRepository.findAll()).thenReturn(Collections.singletonList(e));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("EMPLOYEE").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("Son Minh", resp.getData().get(0).get("Full Name"));
    }

    @Test
    void testPreviewReportSupport() {
        SupportTicket s = SupportTicket.builder().ticketNumber("TK123").subject("Help").status(SupportTicket.TicketStatus.OPEN).priority(SupportTicket.TicketPriority.MEDIUM).build();
        when(supportTicketRepository.findAll()).thenReturn(Collections.singletonList(s));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("SUPPORT").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("TK123", resp.getData().get(0).get("Ticket Number"));
    }

    @Test
    void testPreviewReportIncident() {
        Incident i = Incident.builder().incidentNumber("INC99").severity(Incident.IncidentSeverity.HIGH).status(Incident.IncidentStatus.OPEN).description("Leak").build();
        when(incidentRepository.findAll()).thenReturn(Collections.singletonList(i));

        ReportPreviewRequest req = ReportPreviewRequest.builder().reportType("INCIDENT").filters(new HashMap<>()).build();
        ReportPreviewResponse resp = reportService.previewReport(req);
        assertNotNull(resp);
        assertEquals("INC99", resp.getData().get(0).get("Incident Number"));
    }

    @Test
    void testGetReportHistory() {
        ReportHistory h = ReportHistory.builder().id(1L).reportType("REVENUE").status(ReportHistory.ReportStatus.COMPLETED).build();
        when(reportHistoryRepository.findAll()).thenReturn(Collections.singletonList(h));

        List<ReportHistoryResponse> list = reportService.getReportHistory();
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
    }

    @Test
    void testDeleteReportHistory() {
        reportService.deleteReportHistory(1L);
        verify(reportHistoryRepository).deleteById(1L);
    }

    @Test
    void testGetSchedules() {
        ReportSchedule sc = ReportSchedule.builder().id(1L).reportType("REVENUE").cronExpression("0 0 0 * * ?").enabled(true).build();
        when(reportScheduleRepository.findAll()).thenReturn(Collections.singletonList(sc));

        List<ReportScheduleResponse> list = reportService.getSchedules();
        assertEquals(1, list.size());
    }

    @Test
    void testGetScheduleById() {
        ReportSchedule sc = ReportSchedule.builder().id(1L).reportType("REVENUE").enabled(true).build();
        when(reportScheduleRepository.findById(1L)).thenReturn(Optional.of(sc));

        ReportScheduleResponse resp = reportService.getScheduleById(1L);
        assertNotNull(resp);
        assertEquals(1L, resp.getId());
    }

    @Test
    void testCreateSchedule() {
        when(reportScheduleRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportScheduleRequest req = ReportScheduleRequest.builder()
                .reportType("REVENUE")
                .cronExpression("0 0 0 * * ?")
                .exportFormat("EXCEL")
                .enabled(true)
                .build();

        ReportScheduleResponse resp = reportService.createSchedule(req);
        assertNotNull(resp);
        assertEquals("REVENUE", resp.getReportType());
    }

    @Test
    void testUpdateSchedule() {
        ReportSchedule sc = ReportSchedule.builder().id(1L).reportType("REVENUE").enabled(true).build();
        when(reportScheduleRepository.findById(1L)).thenReturn(Optional.of(sc));
        when(reportScheduleRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportScheduleRequest req = ReportScheduleRequest.builder()
                .reportType("TICKET")
                .cronExpression("0 0 0 * * ?")
                .exportFormat("EXCEL")
                .enabled(false)
                .build();

        ReportScheduleResponse resp = reportService.updateSchedule(1L, req);
        assertNotNull(resp);
        assertEquals("TICKET", resp.getReportType());
        assertFalse(resp.isEnabled());
    }

    @Test
    void testDeleteSchedule() {
        reportService.deleteSchedule(1L);
        verify(reportScheduleRepository).deleteById(1L);
    }

    @Test
    void testEnableDisableSchedule() {
        ReportSchedule sc = ReportSchedule.builder().id(1L).enabled(false).build();
        when(reportScheduleRepository.findById(1L)).thenReturn(Optional.of(sc));
        when(reportScheduleRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ReportScheduleResponse resp = reportService.enableSchedule(1L);
        assertTrue(resp.isEnabled());

        resp = reportService.disableSchedule(1L);
        assertFalse(resp.isEnabled());
    }

    @Test
    void testRunScheduleImmediately() {
        ReportSchedule sc = ReportSchedule.builder().id(1L).reportType("REVENUE").exportFormat("EXCEL").build();
        when(reportScheduleRepository.findById(1L)).thenReturn(Optional.of(sc));
        when(reportHistoryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        reportService.runScheduleImmediately(1L);
        verify(reportHistoryRepository).save(any());
    }
}
