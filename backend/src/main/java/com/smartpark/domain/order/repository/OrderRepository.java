package com.smartpark.domain.order.repository;

import com.smartpark.domain.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = com.smartpark.domain.order.entity.Order.OrderStatus.PAID AND o.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumTotalAmountByStatusPaidAndCreatedAtBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query("SELECT COALESCE(SUM(item.totalPrice), 0) FROM OrderItem item WHERE item.itemType = :itemType AND item.order.status = com.smartpark.domain.order.entity.Order.OrderStatus.PAID AND item.order.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumOrderItemPriceByTypeAndDateRange(@org.springframework.data.repository.query.Param("itemType") String itemType, @org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT DATE(created_at) as dateVal, SUM(total_amount) FROM orders WHERE status = 'PAID' AND created_at BETWEEN :from AND :to GROUP BY DATE(created_at) ORDER BY dateVal ASC", nativeQuery = true)
    List<Object[]> sumDailyRevenueBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
