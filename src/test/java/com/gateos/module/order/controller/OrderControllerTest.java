package com.gateos.module.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.auth.entity.Customer;
import com.gateos.module.auth.repository.CustomerRepository;
import com.gateos.module.order.dto.CreateOrderRequest;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.service.OrderService;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private CustomerRepository customerRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "1", roles = {"CUSTOMER"})
    void shouldCreateOrder_WhenCustomer() throws Exception {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setVenueId(1L);
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setTicketTypeId(5L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        Order order = Order.builder()
                .id(10L)
                .orderCode("GOS-1234")
                .totalAmount(BigDecimal.valueOf(200000))
                .build();

        Customer mockCustomer = Customer.builder().id(1L).username("1").build();
        when(customerRepository.findByUsername("1")).thenReturn(Optional.of(mockCustomer));
        when(orderService.createOrder(anyLong(), any(CreateOrderRequest.class))).thenReturn(order);

        // Act & Assert
        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderCode").value("GOS-1234"));

        verify(orderService).createOrder(anyLong(), any(CreateOrderRequest.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldReturn403_WhenCreateOrderAsAdmin() throws Exception {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setVenueId(1L);
        CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
        item.setTicketTypeId(5L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        // Act & Assert
        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "1", roles = {"CUSTOMER"})
    void shouldReturn422_WhenCreateOrderIsInvalid() throws Exception {
        // Arrange
        CreateOrderRequest request = new CreateOrderRequest();
        request.setVenueId(null); // Invalid
        request.setItems(List.of()); // Invalid

        // Act & Assert
        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-VALIDATION-001"));
    }

    @Test
    @WithMockUser(username = "cust", roles = {"CUSTOMER"})
    void shouldGetOrderByCode_WhenAuthenticated() throws Exception {
        // Arrange
        Order order = Order.builder().id(10L).orderCode("GOS-1234").build();
        when(orderService.getByCode("GOS-1234")).thenReturn(order);

        // Act & Assert
        mockMvc.perform(get("/api/v1/orders/GOS-1234")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.orderCode").value("GOS-1234"));
    }

    @Test
    void shouldReturn403_WhenGetOrderByCodeAnonymous() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/orders/GOS-1234"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldGetAllOrders_WhenManager() throws Exception {
        // Arrange
        when(orderService.getAllOrders(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(Order.builder().id(10L).build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/orders")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenGetAllOrdersAsCustomer() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "1", roles = {"CUSTOMER"})
    void shouldCancelOrder_WhenCustomer() throws Exception {
        // Arrange
        Order cancelled = Order.builder().id(10L).paymentStatus(Order.PaymentStatus.CANCELLED).build();
        Customer mockCustomer = Customer.builder().id(1L).username("1").build();
        when(customerRepository.findByUsername("1")).thenReturn(Optional.of(mockCustomer));
        when(orderService.cancelOrder(eq(10L), anyLong())).thenReturn(cancelled);

        // Act & Assert
        mockMvc.perform(post("/api/v1/orders/10/cancel")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("CANCELLED"));
    }
}

