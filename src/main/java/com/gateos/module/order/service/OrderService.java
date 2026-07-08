package com.gateos.module.order.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.module.order.dto.CreateOrderRequest;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.entity.OrderItem;
import com.gateos.module.order.repository.OrderRepository;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final TicketTypeRepository ticketTypeRepository;

    @Value("${app.order.timeout-minutes:15}")
    private int orderTimeoutMinutes;

    @Transactional
    public Order createOrder(Long customerId, CreateOrderRequest request) {
        // Validate total quantity <= 10 across all items per BR-ORD-01
        int totalQty = request.getItems().stream().mapToInt(CreateOrderRequest.OrderItemRequest::getQuantity).sum();
        if (totalQty > 10) {
            throw BusinessException.badRequest("Bạn chỉ được đặt tối đa 10 vé cho mỗi lần giao dịch", "ERR-ORD-001");
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        Order order = Order.builder()
                .customerId(customerId)
                .venueId(request.getVenueId())
                .orderCode("GOS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();


        order = orderRepository.save(order);

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            TicketType tt = ticketTypeRepository.findById(itemReq.getTicketTypeId())
                    .orElseThrow(() -> BusinessException.notFound("Loại vé không tồn tại", "ERR-TKT-003"));
            if (tt.getStatus() == TicketType.TicketTypeStatus.INACTIVE) {
                throw BusinessException.badRequest("Loại vé \"" + tt.getName() + "\" không còn kinh doanh", "ERR-TKT-004");
            }

            BigDecimal lineTotal = tt.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            total = total.add(lineTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .ticketTypeId(tt.getId())
                    .quantity(itemReq.getQuantity())
                    .price(tt.getPrice())
                    .build();
            items.add(item);
        }

        order.setItems(items);
        order.setTotalAmount(total);
        return orderRepository.save(order);
    }

    public Order getByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> BusinessException.notFound("Đơn hàng không tồn tại", "ERR-ORD-003"));
    }

    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Đơn hàng không tồn tại", "ERR-ORD-003"));
    }

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    public Page<Order> getOrdersByCustomer(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable);
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long customerId) {
        Order order = getById(orderId);
        if (!order.getCustomerId().equals(customerId)) {
            throw BusinessException.forbidden("Bạn không có quyền hủy đơn hàng này", "ERR-ORD-004");
        }
        if (order.getPaymentStatus() != Order.PaymentStatus.PENDING) {
            throw BusinessException.badRequest("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING", "ERR-ORD-005");
        }
        order.setPaymentStatus(Order.PaymentStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * Scheduled task: Tự động hủy đơn hàng PENDING quá 15 phút (BR-ORD-03)
     */
    @Scheduled(fixedDelay = 60000) // chạy mỗi 1 phút
    @Transactional
    public void timeoutPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(orderTimeoutMinutes);
        List<Order> expiredOrders = orderRepository
                .findByPaymentStatusAndCreatedAtBefore(Order.PaymentStatus.PENDING, cutoff);

        if (!expiredOrders.isEmpty()) {
            expiredOrders.forEach(o -> o.setPaymentStatus(Order.PaymentStatus.TIMEOUT));
            orderRepository.saveAll(expiredOrders);
            log.info("Auto-timeout {} pending orders", expiredOrders.size());
        }
    }
}
