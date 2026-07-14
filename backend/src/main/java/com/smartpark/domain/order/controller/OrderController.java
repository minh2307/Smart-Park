package com.smartpark.domain.order.controller;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.auth.entity.User;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.order.dto.OrderDto;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.mapper.OrderMapper;
import com.smartpark.domain.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * OrderController - Quản lý đơn hàng.
 * <p>
 * - ADMIN: xem tất cả, xem theo ID
 * - CUSTOMER: xem đơn hàng của mình (customer-scoped)
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Tag(name = "Orders", description = "Quản lý đơn hàng")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    // ────────────── ADMIN endpoints ──────────────

    /**
     * Admin: danh sách tất cả đơn hàng (paginated).
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Lấy tất cả đơn hàng")
    public ResponseEntity<ApiResponse<Page<OrderDto.OrderResponse>>> findAll(Pageable pageable) {
        Page<Order> page = orderService.findAll(pageable);
        List<OrderDto.OrderResponse> content = page.getContent().stream()
                .map(orderMapper::toSummaryResponse)
                .collect(Collectors.toList());
        Page<OrderDto.OrderResponse> result = new PageImpl<>(content, pageable, page.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Admin: xem chi tiết theo ID (includes payments & refunds).
     */
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Chi tiết đơn hàng theo ID")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> findByIdAdmin(@PathVariable Long id) {
        Order order = orderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }

    // ────────────── CUSTOMER endpoints ──────────────

    /**
     * Customer: danh sách đơn hàng của mình.
     * Frontend calls: GET /orders?page=0&size=20&sort=createdAt,desc
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Lấy danh sách đơn hàng của khách hàng đang đăng nhập")
    public ResponseEntity<ApiResponse<Page<OrderDto.OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {

        Long customerId = resolveCustomerId(userDetails.getUsername());
        Page<Order> page = orderService.findByCustomer(customerId, pageable);
        List<OrderDto.OrderResponse> content = page.getContent().stream()
                .map(orderMapper::toSummaryResponse)
                .collect(Collectors.toList());
        Page<OrderDto.OrderResponse> result = new PageImpl<>(content, pageable, page.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Customer: chi tiết đơn hàng theo ID.
     * Includes payments & refunds arrays required by OrderDetailPage.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Chi tiết đơn hàng theo ID (bao gồm payments và refunds)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Order order = orderService.findById(id);
        // Security: customer can only view their own orders
        if (isCustomerRole(userDetails)) {
            Long customerId = resolveCustomerId(userDetails.getUsername());
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new ResourceNotFoundException("Order", id);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }

    /**
     * Customer: chi tiết đơn hàng theo orderCode.
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Chi tiết đơn hàng theo orderCode")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> findByCode(
            @PathVariable String code,
            @AuthenticationPrincipal UserDetails userDetails) {

        Order order = orderService.findByCode(code);
        if (isCustomerRole(userDetails)) {
            Long customerId = resolveCustomerId(userDetails.getUsername());
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new ResourceNotFoundException("Order", code);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(order)));
    }

    /**
     * Admin: xác nhận thanh toán thủ công (dành cho admin).
     */
    @PostMapping("/code/{code}/confirm-payment")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @Operation(summary = "Admin: Xác nhận thanh toán đơn hàng")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> confirmPayment(@PathVariable String code) {
        Order order = orderService.confirmPayment(code);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toSummaryResponse(order)));
    }

    /**
     * Customer: hủy đơn hàng (chỉ PENDING).
     */
    @PostMapping("/code/{code}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    @Operation(summary = "Hủy đơn hàng (chỉ áp dụng với đơn PENDING)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> cancelOrder(
            @PathVariable String code,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Verify ownership for customer
        if (isCustomerRole(userDetails)) {
            Order order = orderService.findByCode(code);
            Long customerId = resolveCustomerId(userDetails.getUsername());
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new ResourceNotFoundException("Order", code);
            }
        }
        Order order = orderService.cancelOrder(code);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toSummaryResponse(order)));
    }

    /**
     * Admin/Customer: Hủy đơn hàng theo ID.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    @Operation(summary = "Hủy đơn hàng theo ID (chỉ áp dụng với đơn PENDING)")
    public ResponseEntity<ApiResponse<OrderDto.OrderResponse>> cancelOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Order order = orderService.findById(id);
        if (isCustomerRole(userDetails)) {
            Long customerId = resolveCustomerId(userDetails.getUsername());
            if (!order.getCustomer().getId().equals(customerId)) {
                throw new ResourceNotFoundException("Order", id);
            }
        }
        Order cancelledOrder = orderService.cancelOrder(order.getOrderCode());
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toSummaryResponse(cancelledOrder)));
    }

    // ─────────────────── helpers ───────────────────

    private Long resolveCustomerId(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer for user", username));
        return customer.getId();
    }

    private boolean isCustomerRole(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }
}
