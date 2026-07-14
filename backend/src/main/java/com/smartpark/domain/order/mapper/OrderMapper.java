package com.smartpark.domain.order.mapper;

import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.order.dto.OrderDto;
import com.smartpark.domain.order.entity.Order;
import com.smartpark.domain.order.entity.OrderItem;
import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.entity.PaymentMethod;
import com.smartpark.domain.order.entity.Refund;
import com.smartpark.domain.order.repository.PaymentRepository;
import com.smartpark.domain.order.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * OrderMapper - converts Order entities to DTOs.
 * Handles Payment and Refund associations (not mapped on Order entity to avoid N+1).
 */
@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    public OrderDto.OrderResponse toResponse(Order order) {
        OrderDto.OrderResponse dto = new OrderDto.OrderResponse();
        dto.setId(order.getId());
        dto.setBookingId(order.getBookingId());
        dto.setOrderCode(order.getOrderCode());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        // Map customer
        if (order.getCustomer() != null) {
            dto.setCustomer(mapCustomer(order.getCustomer()));
        }

        // Map items
        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(this::mapItem).collect(Collectors.toList()));
        } else {
            dto.setItems(Collections.emptyList());
        }

        // Eagerly load payments (no bidirectional mapping on Order to avoid circular refs)
        List<Payment> payments = paymentRepository.findByOrderId(order.getId());
        dto.setPayments(payments.stream().map(this::mapPayment).collect(Collectors.toList()));

        // Load refunds through payments
        List<OrderDto.RefundResponse> refunds = payments.stream()
                .flatMap(p -> refundRepository.findByPaymentId(p.getId()).stream())
                .map(this::mapRefund)
                .collect(Collectors.toList());
        dto.setRefunds(refunds);

        return dto;
    }

    /** Lightweight response without payments/refunds — used for list endpoints (performance). */
    public OrderDto.OrderResponse toSummaryResponse(Order order) {
        OrderDto.OrderResponse dto = new OrderDto.OrderResponse();
        dto.setId(order.getId());
        dto.setBookingId(order.getBookingId());
        dto.setOrderCode(order.getOrderCode());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getCustomer() != null) {
            dto.setCustomer(mapCustomer(order.getCustomer()));
        }

        if (order.getItems() != null) {
            dto.setItems(order.getItems().stream().map(this::mapItem).collect(Collectors.toList()));
        } else {
            dto.setItems(Collections.emptyList());
        }

        dto.setPayments(Collections.emptyList());
        dto.setRefunds(Collections.emptyList());
        return dto;
    }

    private OrderDto.CustomerInfo mapCustomer(Customer customer) {
        OrderDto.CustomerInfo info = new OrderDto.CustomerInfo();
        info.setId(customer.getId());
        info.setFullName(customer.getFullName());
        info.setPhone(customer.getPhone());
        // email is on User; Customer has userId → for now derive from fullName; email enrichment happens in controller if needed
        return info;
    }

    private OrderDto.OrderItemResponse mapItem(OrderItem item) {
        OrderDto.OrderItemResponse dto = new OrderDto.OrderItemResponse();
        dto.setId(item.getId());
        dto.setItemType(item.getItemType());
        dto.setReferenceId(item.getReferenceId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }

    private OrderDto.PaymentResponse mapPayment(Payment payment) {
        OrderDto.PaymentResponse dto = new OrderDto.PaymentResponse();
        dto.setId(payment.getId());
        dto.setOrderId(payment.getOrder() != null ? payment.getOrder().getId() : null);
        dto.setTransactionReference(payment.getTransactionReference());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus().name());
        dto.setPaymentTime(payment.getPaymentTime());

        if (payment.getPaymentMethod() != null) {
            dto.setPaymentMethod(mapPaymentMethod(payment.getPaymentMethod()));
        }
        return dto;
    }

    private OrderDto.PaymentMethodInfo mapPaymentMethod(PaymentMethod method) {
        OrderDto.PaymentMethodInfo dto = new OrderDto.PaymentMethodInfo();
        dto.setId(method.getId());
        dto.setName(method.getName());
        dto.setCode(method.getCode());
        dto.setProvider(method.getProvider());
        dto.setStatus(method.getStatus().name());
        return dto;
    }

    private OrderDto.RefundResponse mapRefund(Refund refund) {
        OrderDto.RefundResponse dto = new OrderDto.RefundResponse();
        dto.setId(refund.getId());
        dto.setPaymentId(refund.getPayment() != null ? refund.getPayment().getId() : null);
        dto.setAmount(refund.getAmount());
        dto.setReason(refund.getReason());
        dto.setStatus(refund.getStatus().name());
        dto.setCreatedAt(refund.getCreatedAt());
        dto.setUpdatedAt(refund.getUpdatedAt());
        return dto;
    }
}
