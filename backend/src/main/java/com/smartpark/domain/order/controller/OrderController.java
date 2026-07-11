package com.smartpark.domain.order.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> findAll(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(orderService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.findById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Order>> findByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(orderService.findByCode(code)));
    }

    @PostMapping("/code/{code}/confirm-payment")
    public ResponseEntity<ApiResponse<Order>> confirmPayment(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(orderService.confirmPayment(code)));
    }

    @PostMapping("/code/{code}/cancel")
    public ResponseEntity<ApiResponse<Order>> cancelOrder(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(orderService.cancelOrder(code)));
    }
}
