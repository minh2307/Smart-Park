package com.gateos.module.payment.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.ticket.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VNPayServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TicketService ticketService;

    @InjectMocks
    private VNPayService vnPayService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vnPayService, "tmnCode", "TMN123");
        ReflectionTestUtils.setField(vnPayService, "hashSecret", "SECRET123");
        ReflectionTestUtils.setField(vnPayService, "payUrl", "https://vnpay.vn");
        ReflectionTestUtils.setField(vnPayService, "returnUrl", "https://return.vn");
    }

    @Test
    void shouldCreatePaymentUrl_WhenPendingOrder() {
        // Arrange
        Order order = Order.builder()
                .orderCode("GOS-ORD123")
                .paymentStatus(Order.PaymentStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(100000))
                .build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));

        // Act
        String url = vnPayService.createPaymentUrl("GOS-ORD123", "127.0.0.1");

        // Assert
        assertNotNull(url);
        assertTrue(url.startsWith("https://vnpay.vn?"));
        assertTrue(url.contains("vnp_Amount=10000000")); // Amount * 100
        assertTrue(url.contains("vnp_TxnRef=GOS-ORD123"));
        assertTrue(url.contains("vnp_SecureHash="));
    }

    @Test
    void shouldThrowNotFound_WhenCreatePaymentUrlAndOrderDoesNotExist() {
        // Arrange
        when(orderRepository.findByOrderCode("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> vnPayService.createPaymentUrl("INVALID", "127.0.0.1"));
        assertEquals("ERR-ORD-003", ex.getErrorCode());
    }

    @Test
    void shouldThrowBadRequest_WhenCreatePaymentUrlAndOrderNotPending() {
        // Arrange
        Order order = Order.builder()
                .orderCode("GOS-ORD123")
                .paymentStatus(Order.PaymentStatus.PAID)
                .totalAmount(BigDecimal.valueOf(100000))
                .build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> vnPayService.createPaymentUrl("GOS-ORD123", "127.0.0.1"));
        assertEquals("ERR-PAY-002", ex.getErrorCode());
    }

    @Test
    void shouldProcessIPN_WhenInvalidSignature() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_SecureHash")).thenReturn("INVALID_HASH");

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("97", response.get("RspCode"));
        assertEquals("Invalid Signature", response.get("Message"));
    }

    @Test
    void shouldProcessIPN_WhenOrderNotFound() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        Map<String, String> rawParams = new TreeMap<>();
        rawParams.put("vnp_TxnRef", "GOS-ORD123");
        rawParams.put("vnp_ResponseCode", "00");
        rawParams.put("vnp_TransactionNo", "TRN12345");

        String query = "vnp_ResponseCode=00&vnp_TransactionNo=TRN12345&vnp_TxnRef=GOS-ORD123";
        String validHash = hmacSHA512("SECRET123", query);

        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_ResponseCode", "vnp_TransactionNo", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_ResponseCode")).thenReturn("00");
        when(request.getParameter("vnp_TransactionNo")).thenReturn("TRN12345");
        when(request.getParameter("vnp_SecureHash")).thenReturn(validHash);

        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.empty());

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("01", response.get("RspCode"));
    }

    @Test
    void shouldProcessIPN_WhenOrderAlreadyPaid() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        String query = "vnp_ResponseCode=00&vnp_TransactionNo=TRN12345&vnp_TxnRef=GOS-ORD123";
        String validHash = hmacSHA512("SECRET123", query);

        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_ResponseCode", "vnp_TransactionNo", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_ResponseCode")).thenReturn("00");
        when(request.getParameter("vnp_TransactionNo")).thenReturn("TRN12345");
        when(request.getParameter("vnp_SecureHash")).thenReturn(validHash);

        Order order = Order.builder().orderCode("GOS-ORD123").paymentStatus(Order.PaymentStatus.PAID).build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("02", response.get("RspCode"));
    }

    @Test
    void shouldProcessIPN_WhenSuccessAndTicketGenerationSucceeds() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        String query = "vnp_ResponseCode=00&vnp_TransactionNo=TRN12345&vnp_TxnRef=GOS-ORD123";
        String validHash = hmacSHA512("SECRET123", query);

        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_ResponseCode", "vnp_TransactionNo", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_ResponseCode")).thenReturn("00");
        when(request.getParameter("vnp_TransactionNo")).thenReturn("TRN12345");
        when(request.getParameter("vnp_SecureHash")).thenReturn(validHash);

        Order order = Order.builder().orderCode("GOS-ORD123").paymentStatus(Order.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("00", response.get("RspCode"));
        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
        assertEquals("VNPAY", order.getPaymentMethod());
        assertEquals("TRN12345", order.getPaymentTransactionId());
        verify(ticketService).generateTicketsForOrder(order);
        verify(orderRepository).save(order);
    }

    @Test
    void shouldProcessIPN_WhenSuccessButTicketGenerationFails() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        String query = "vnp_ResponseCode=00&vnp_TransactionNo=TRN12345&vnp_TxnRef=GOS-ORD123";
        String validHash = hmacSHA512("SECRET123", query);

        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_ResponseCode", "vnp_TransactionNo", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_ResponseCode")).thenReturn("00");
        when(request.getParameter("vnp_TransactionNo")).thenReturn("TRN12345");
        when(request.getParameter("vnp_SecureHash")).thenReturn(validHash);

        Order order = Order.builder().orderCode("GOS-ORD123").paymentStatus(Order.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));
        doThrow(new RuntimeException("Redis error")).when(ticketService).generateTicketsForOrder(any(Order.class));

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("00", response.get("RspCode")); // Still returns 00 confirming IPN processed
        assertEquals(Order.PaymentStatus.PAID, order.getPaymentStatus());
    }

    @Test
    void shouldProcessIPN_WhenFailedPaymentResponseCode() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        String query = "vnp_ResponseCode=24&vnp_TransactionNo=TRN12345&vnp_TxnRef=GOS-ORD123";
        String validHash = hmacSHA512("SECRET123", query);

        Vector<String> paramNames = new Vector<>(List.of("vnp_TxnRef", "vnp_ResponseCode", "vnp_TransactionNo", "vnp_SecureHash"));
        when(request.getParameterNames()).thenReturn(paramNames.elements());
        when(request.getParameter("vnp_TxnRef")).thenReturn("GOS-ORD123");
        when(request.getParameter("vnp_ResponseCode")).thenReturn("24");
        when(request.getParameter("vnp_TransactionNo")).thenReturn("TRN12345");
        when(request.getParameter("vnp_SecureHash")).thenReturn(validHash);

        Order order = Order.builder().orderCode("GOS-ORD123").paymentStatus(Order.PaymentStatus.PENDING).build();
        when(orderRepository.findByOrderCode("GOS-ORD123")).thenReturn(Optional.of(order));

        // Act
        Map<String, String> response = vnPayService.processIPN(request);

        // Assert
        assertEquals("00", response.get("RspCode"));
        assertEquals(Order.PaymentStatus.FAILED, order.getPaymentStatus());
        verify(orderRepository).save(order);
        verify(ticketService, never()).generateTicketsForOrder(any());
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("HmacSHA512 error", e);
        }
    }
}
