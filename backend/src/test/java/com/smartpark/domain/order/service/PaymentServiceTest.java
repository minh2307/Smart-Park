package com.smartpark.domain.order.service;

import com.smartpark.common.exception.ConflictException;
import com.smartpark.config.VNPayConfig;
import com.smartpark.domain.booking.service.BookingService;
import com.smartpark.domain.order.dto.PaymentDto;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.entity.PaymentMethod;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.order.repository.PaymentMethodRepository;
import com.smartpark.domain.order.repository.PaymentRepository;
import com.smartpark.domain.order.repository.RefundRepository;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentMethodRepository paymentMethodRepository;
    @Mock
    private OrderService orderService;
    @Mock
    private BookingService bookingService;
    @Mock
    private VNPayConfig vnPayConfig;
    @Mock
    private RefundRepository refundRepository;
    @Mock
    private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private PaymentService paymentService;

    private Order mockOrder;
    private PaymentMethod mockMethod;

    @BeforeEach
    void setup() {
        mockOrder = Order.builder()
                .id(1L)
                .orderCode("ORD-123")
                .totalAmount(new BigDecimal("500000"))
                .status(Order.OrderStatus.PENDING)
                .build();

        mockMethod = PaymentMethod.builder()
                .code("VNPAY")
                .status(PaymentMethod.PaymentMethodStatus.ACTIVE)
                .build();
    }

    @Test
    void testCreatePayment_Success() {
        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setOrderCode("ORD-123");
        req.setPaymentMethodCode("VNPAY");

        when(orderService.findByCode("ORD-123")).thenReturn(mockOrder);
        when(paymentMethodRepository.findByCode("VNPAY")).thenReturn(Optional.of(mockMethod));
        when(vnPayConfig.getVnpTmnCode()).thenReturn("TMNCODE");
        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRET");
        when(vnPayConfig.getVnpPayUrl()).thenReturn("http://vnpay.vn");
        when(vnPayConfig.hmacSHA512(any(), any())).thenReturn("HASH");

        PaymentDto.PaymentResponse res = paymentService.createPayment(req);

        assertNotNull(res);
        assertTrue(res.getPaymentUrl().startsWith("http://vnpay.vn"));
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void testCreatePayment_OrderNotPending() {
        mockOrder.setStatus(Order.OrderStatus.PAID);
        when(orderService.findByCode("ORD-123")).thenReturn(mockOrder);

        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setOrderCode("ORD-123");

        assertThrows(ConflictException.class, () -> {
            paymentService.createPayment(req);
        });
    }

    @Test
    void testProcessVNPayIpn_Success() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_SecureHash", "VALID_HASH");
        params.put("vnp_TxnRef", "TXN-123");
        params.put("vnp_Amount", "50000000"); // 500k * 100
        params.put("vnp_ResponseCode", "00");

        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRET");
        when(vnPayConfig.hmacSHA512(any(), any())).thenReturn("VALID_HASH");

        Payment mockPayment = Payment.builder()
                .id(1L)
                .transactionReference("TXN-123")
                .amount(new BigDecimal("500000"))
                .status(Payment.PaymentStatus.PENDING)
                .order(mockOrder)
                .build();

        when(paymentRepository.findByTransactionReferenceForUpdate("TXN-123")).thenReturn(Optional.of(mockPayment));

        String result = paymentService.processVNPayIpn(params);

        assertEquals("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}", result);
        assertEquals(Payment.PaymentStatus.SUCCESS, mockPayment.getStatus());
        verify(orderService).confirmPayment("ORD-123");
    }

    @Test
    void testProcessVNPayIpn_InvalidChecksum() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_SecureHash", "INVALID_HASH");

        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRET");
        when(vnPayConfig.hmacSHA512(any(), any())).thenReturn("VALID_HASH");

        String result = paymentService.processVNPayIpn(params);

        assertEquals("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}", result);
    }

    @Test
    void testProcessVNPayIpn_DuplicateCallback() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_SecureHash", "VALID_HASH");
        params.put("vnp_TxnRef", "TXN-123");
        params.put("vnp_Amount", "50000000"); // 500k * 100
        params.put("vnp_ResponseCode", "00");

        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRET");
        when(vnPayConfig.hmacSHA512(any(), any())).thenReturn("VALID_HASH");

        // Payment is already SUCCESS
        Payment mockPayment = Payment.builder()
                .id(1L)
                .transactionReference("TXN-123")
                .amount(new BigDecimal("500000"))
                .status(Payment.PaymentStatus.SUCCESS)
                .order(mockOrder)
                .build();

        when(paymentRepository.findByTransactionReferenceForUpdate("TXN-123")).thenReturn(Optional.of(mockPayment));

        String result = paymentService.processVNPayIpn(params);

        assertEquals("{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}", result);
    }

    @Test
    void testProcessVNPayIpn_FailedPayment() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_SecureHash", "VALID_HASH");
        params.put("vnp_TxnRef", "TXN-123");
        params.put("vnp_Amount", "50000000"); // 500k * 100
        params.put("vnp_ResponseCode", "24"); // Some error code

        when(vnPayConfig.getVnpHashSecret()).thenReturn("SECRET");
        when(vnPayConfig.hmacSHA512(any(), any())).thenReturn("VALID_HASH");

        com.smartpark.domain.customer.entity.Customer mockCustomer = com.smartpark.domain.customer.entity.Customer.builder().id(1L).build();
        mockOrder.setCustomer(mockCustomer);

        Payment mockPayment = Payment.builder()
                .id(1L)
                .transactionReference("TXN-123")
                .amount(new BigDecimal("500000"))
                .status(Payment.PaymentStatus.PENDING)
                .order(mockOrder)
                .build();

        when(paymentRepository.findByTransactionReferenceForUpdate("TXN-123")).thenReturn(Optional.of(mockPayment));

        String result = paymentService.processVNPayIpn(params);

        assertEquals("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}", result); // VNPay expects 00 even on recording a fail
        assertEquals(Payment.PaymentStatus.FAILED, mockPayment.getStatus());
        verify(paymentRepository).save(mockPayment);
    }

    @Test
    void testRequestRefund_InvalidRefund() {
        Payment mockPayment = Payment.builder()
                .id(1L)
                .status(Payment.PaymentStatus.PENDING) // Cannot refund a pending payment
                .amount(new BigDecimal("500000"))
                .build();

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(mockPayment));

        assertThrows(ConflictException.class, () -> {
            paymentService.requestRefund(1L, "Customer requested");
        });
    }

    @Test
    void testApproveRefund_Success() {
        Payment mockPayment = Payment.builder()
                .id(1L)
                .amount(new BigDecimal("500000"))
                .status(Payment.PaymentStatus.SUCCESS)
                .order(mockOrder)
                .build();

        Refund mockRefund = Refund.builder()
                .id(1L)
                .payment(mockPayment)
                .amount(new BigDecimal("500000"))
                .status(Refund.RefundStatus.PENDING)
                .reason("Defective ticket")
                .build();

        when(refundRepository.findById(1L)).thenReturn(Optional.of(mockRefund));
        when(refundRepository.save(any(Refund.class))).thenAnswer(i -> i.getArgument(0));

        com.smartpark.domain.customer.entity.Customer mockCustomer = com.smartpark.domain.customer.entity.Customer.builder().id(1L).build();
        mockOrder.setCustomer(mockCustomer);
        mockOrder.setBookingId(10L);

        Refund approved = paymentService.approveRefund(1L);

        assertNotNull(approved);
        assertEquals(Refund.RefundStatus.COMPLETED, approved.getStatus());
        assertEquals(Payment.PaymentStatus.REFUNDED, mockPayment.getStatus());
        verify(bookingService).cancel(eq("ORD-123"), anyString());
    }

    @Test
    void testCreatePayment_Momo() {
        PaymentDto.PaymentRequest req = new PaymentDto.PaymentRequest();
        req.setOrderCode("ORD-123");
        req.setPaymentMethodCode("MOMO");

        when(orderService.findByCode("ORD-123")).thenReturn(mockOrder);
        PaymentMethod momoMethod = PaymentMethod.builder().code("MOMO").status(PaymentMethod.PaymentMethodStatus.ACTIVE).build();
        when(paymentMethodRepository.findByCode("MOMO")).thenReturn(Optional.of(momoMethod));

        PaymentDto.PaymentResponse res = paymentService.createPayment(req);

        assertNotNull(res);
        assertTrue(res.getPaymentUrl().startsWith("https://momo.vn"));
    }
}
