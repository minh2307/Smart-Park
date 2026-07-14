package com.smartpark.domain.order.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.OrderItem;
import com.smartpark.domain.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * OrderService - Xử lý đơn hàng (có thể link với booking hoặc mua trực tiếp).
 *
 * State machine:
 * PENDING ──(pay)─────────> PAID (sinh vé nếu mua vé)
 * PENDING ──(cancel)──────> CANCELLED
 * PAID    ──(refund)──────> REFUNDED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    // ─────────────────────────────── QUERIES ───────────────────────────────

    @Transactional(readOnly = true)
    public Page<Order> findAll(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Transactional(readOnly = true)
    public Page<Order> findByCustomer(Long customerId, Pageable pageable) {
        // Use derived query from repository; wrap list in a Page
        List<Order> all = orderRepository.findByCustomerId(customerId);
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<Order> paged = (start >= all.size()) ? List.of() : all.subList(start, end);
        return new PageImpl<>(paged, pageable, all.size());
    }

    @Transactional(readOnly = true)
    public Order findByCode(String code) {
        return orderRepository.findByOrderCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Order", code));
    }

    // ─────────────────────────── CREATE ORDER ────────────────────────────

    @Transactional
    public Order createOrder(Long customerId, Long bookingId, List<OrderItem> items) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        BigDecimal subtotal = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Giả lập logic tính thuế và giảm giá (sẽ tích hợp PromotionService sau)
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.1)); // 10% tax
        BigDecimal discount = BigDecimal.ZERO; 
        BigDecimal total = subtotal.add(tax).subtract(discount);

        String orderCode = "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        Order order = Order.builder()
                .customer(customer)
                .bookingId(bookingId)
                .orderCode(orderCode)
                .subtotal(subtotal)
                .taxAmount(tax)
                .discountAmount(discount)
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .build();

        // Gắn order vào các item
        items.forEach(item -> item.setOrder(order));
        order.setItems(items);

        Order saved = orderRepository.save(order);
        log.info("[ORDER CREATED] code={} customerId={} total={}", orderCode, customerId, total);
        return saved;
    }

    // ────────────────────────── CONFIRM PAYMENT ────────────────────────────

    /**
     * Xác nhận thanh toán đơn hàng (sẽ gọi từ Payment Webhook).
     */
    @Transactional
    public Order confirmPayment(String orderCode) {
        Order order = findByCode(orderCode);

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new ConflictException("ERR-ORD-001", "Chỉ có thể thanh toán đơn hàng PENDING.");
        }

        order.setStatus(Order.OrderStatus.PAID);
        Order saved = orderRepository.save(order);

        // TODO: Gọi TicketService.issueTicket(...) nếu order này mua vé
        // TODO: Gọi MembershipService.addPoints(...) để tích điểm cho Customer

        log.info("[ORDER PAID] code={}", orderCode);
        return saved;
    }

    // ──────────────────────────── CANCEL ORDER ─────────────────────────────

    @Transactional
    public Order cancelOrder(String orderCode) {
        Order order = findByCode(orderCode);

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new ConflictException("ERR-ORD-002", "Đơn hàng này đã bị hủy rồi.");
        }
        if (order.getStatus() == Order.OrderStatus.PAID) {
            throw new BusinessException("ERR-ORD-003", "Đơn hàng đã thanh toán. Vui lòng sử dụng luồng Hoàn tiền (Refund).");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        
        log.info("[ORDER CANCELLED] code={}", orderCode);
        return saved;
    }
}
