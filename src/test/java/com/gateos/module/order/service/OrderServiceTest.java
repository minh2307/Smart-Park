package com.gateos.module.order.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.order.dto.CreateOrderRequest;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private TicketTypeRepository ticketTypeRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(orderService, "orderTimeoutMinutes", 15);
    }

    @Test
    void shouldCreateOrder_WhenRequestIsValid() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setVenueId(1L);
        CreateOrderRequest.OrderItemRequest itemReq = new CreateOrderRequest.OrderItemRequest();
        itemReq.setTicketTypeId(5L);
        itemReq.setQuantity(3);
        request.setItems(List.of(itemReq));

        TicketType tt = TicketType.builder()
                .id(5L)
                .name("VIP Ticket")
                .price(BigDecimal.valueOf(100000))
                .status(TicketType.TicketTypeStatus.ACTIVE)
                .build();

        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(tt));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Order order = orderService.createOrder(100L, request);

        // Assert
        assertNotNull(order);
        assertEquals(Order.PaymentStatus.PENDING, order.getPaymentStatus());
        assertEquals(BigDecimal.valueOf(300000), order.getTotalAmount());
        assertEquals(1, order.getItems().size());
        assertEquals(100L, order.getCustomerId());
        verify(orderRepository, times(2)).save(any(Order.class));
    }

    @Test
    void shouldThrowBadRequest_WhenQuantityGreaterThan10() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        CreateOrderRequest.OrderItemRequest item1 = new CreateOrderRequest.OrderItemRequest();
        item1.setQuantity(6);
        CreateOrderRequest.OrderItemRequest item2 = new CreateOrderRequest.OrderItemRequest();
        item2.setQuantity(5);
        request.setItems(List.of(item1, item2));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.createOrder(100L, request));
        assertEquals("ERR-ORD-001", ex.getErrorCode());
    }

    @Test
    void shouldThrowNotFound_WhenTicketTypeDoesNotExist() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setTicketTypeId(99L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        when(ticketTypeRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.createOrder(100L, request));
        assertEquals("ERR-TKT-003", ex.getErrorCode());
    }

    @Test
    void shouldThrowBadRequest_WhenTicketTypeIsInactive() {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setTicketTypeId(5L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        TicketType tt = TicketType.builder()
                .id(5L)
                .name("Old Ticket")
                .status(TicketType.TicketTypeStatus.INACTIVE)
                .build();

        when(ticketTypeRepository.findById(5L)).thenReturn(Optional.of(tt));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.createOrder(100L, request));
        assertEquals("ERR-TKT-004", ex.getErrorCode());
    }

    @Test
    void shouldGetByCode_WhenExists() {
        // Arrange
        Order order = Order.builder().orderCode("GOS-123456").build();
        when(orderRepository.findByOrderCode("GOS-123456")).thenReturn(Optional.of(order));

        // Act
        Order result = orderService.getByCode("GOS-123456");

        // Assert
        assertNotNull(result);
        assertEquals("GOS-123456", result.getOrderCode());
    }

    @Test
    void shouldThrowNotFound_WhenGetByCodeDoesNotExist() {
        // Arrange
        when(orderRepository.findByOrderCode("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.getByCode("INVALID"));
        assertEquals("ERR-ORD-003", ex.getErrorCode());
    }

    @Test
    void shouldGetById_WhenExists() {
        // Arrange
        Order order = Order.builder().id(10L).build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act
        Order result = orderService.getById(10L);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getId());
    }

    @Test
    void shouldThrowNotFound_WhenGetByIdDoesNotExist() {
        // Arrange
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.getById(99L));
        assertEquals("ERR-ORD-003", ex.getErrorCode());
    }

    @Test
    void shouldGetAllOrders() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> page = new PageImpl<>(List.of(new Order()));
        when(orderRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<Order> result = orderService.getAllOrders(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldGetOrdersByCustomer() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Order> page = new PageImpl<>(List.of(new Order()));
        when(orderRepository.findByCustomerId(100L, pageable)).thenReturn(page);

        // Act
        Page<Order> result = orderService.getOrdersByCustomer(100L, pageable);

        // Assert
        assertNotNull(result);
    }

    @Test
    void shouldCancelOrder_WhenPendingAndBelongsToCustomer() {
        // Arrange
        Order order = Order.builder()
                .id(10L)
                .customerId(100L)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        Order result = orderService.cancelOrder(10L, 100L);

        // Assert
        assertNotNull(result);
        assertEquals(Order.PaymentStatus.CANCELLED, result.getPaymentStatus());
    }

    @Test
    void shouldThrowForbidden_WhenCancellingOrderOfOtherCustomer() {
        // Arrange
        Order order = Order.builder()
                .id(10L)
                .customerId(100L)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.cancelOrder(10L, 200L));
        assertEquals("ERR-ORD-004", ex.getErrorCode());
    }

    @Test
    void shouldThrowBadRequest_WhenCancellingNonPendingOrder() {
        // Arrange
        Order order = Order.builder()
                .id(10L)
                .customerId(100L)
                .paymentStatus(Order.PaymentStatus.PAID)
                .build();
        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class, () -> orderService.cancelOrder(10L, 100L));
        assertEquals("ERR-ORD-005", ex.getErrorCode());
    }

    @Test
    void shouldTimeoutPendingOrders_WhenExpiredExist() {
        // Arrange
        Order order1 = Order.builder().id(1L).paymentStatus(Order.PaymentStatus.PENDING).build();
        Order order2 = Order.builder().id(2L).paymentStatus(Order.PaymentStatus.PENDING).build();
        when(orderRepository.findByPaymentStatusAndCreatedAtBefore(eq(Order.PaymentStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of(order1, order2));

        // Act
        orderService.timeoutPendingOrders();

        // Assert
        assertEquals(Order.PaymentStatus.TIMEOUT, order1.getPaymentStatus());
        assertEquals(Order.PaymentStatus.TIMEOUT, order2.getPaymentStatus());
        verify(orderRepository).saveAll(anyList());
    }

    @Test
    void shouldDoNothing_WhenNoExpiredPendingOrders() {
        // Arrange
        when(orderRepository.findByPaymentStatusAndCreatedAtBefore(eq(Order.PaymentStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of());

        // Act
        orderService.timeoutPendingOrders();

        // Assert
        verify(orderRepository, never()).saveAll(anyList());
    }
}
