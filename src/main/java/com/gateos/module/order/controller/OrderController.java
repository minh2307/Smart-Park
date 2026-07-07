package com.gateos.module.order.controller;

import com.gateos.common.response.ApiResponse;
import com.gateos.module.order.dto.CreateOrderRequest;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Order & Booking", description = "Đặt vé và quản lý hóa đơn")
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Tạo đơn đặt vé mới (Customer)")
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        // Extract customer id from token subject (username) - simplified, normally load from DB
        Long customerId = Long.parseLong(
                authentication.getName().replaceAll("[^0-9]", "").isEmpty() ? "1" : "1"
        );
        // In production, resolve customer ID via a UserContext service
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(orderService.createOrder(customerId, request), "Đặt vé thành công"));
    }

    @Operation(summary = "Lấy chi tiết đơn hàng theo mã")
    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<Order>> getByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getByCode(orderCode)));
    }

    @Operation(summary = "Danh sách đơn hàng (Admin/Manager)")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<Order>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(PageRequest.of(page, size))));
    }

    @Operation(summary = "Hủy đơn hàng (Customer)")
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Order>> cancel(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.cancelOrder(id, 1L), "Đơn hàng đã được hủy"));
    }
}
