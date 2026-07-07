package com.gateos.module.order.repository;

import com.gateos.module.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    List<Order> findByPaymentStatusAndCreatedAtBefore(
            Order.PaymentStatus status, LocalDateTime before);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'PAID' " +
           "AND o.paymentTime >= :from AND o.paymentTime <= :to")
    java.math.BigDecimal sumRevenueBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = 'PAID' " +
           "AND o.paymentTime >= :from AND o.paymentTime <= :to")
    long countPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
