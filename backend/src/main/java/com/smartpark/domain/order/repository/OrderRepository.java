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

    @Query(value = "SELECT DATE(created_at) as period, SUM(total_amount) as totalRevenue, COUNT(id) as txCount FROM orders WHERE status = 'PAID' AND created_at BETWEEN :from AND :to GROUP BY DATE(created_at) ORDER BY period ASC", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.DailyRevenueProjection> getDailyRevenueTrend(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as period, SUM(total_amount) as totalRevenue, COUNT(id) as txCount FROM orders WHERE status = 'PAID' AND created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY period ASC", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.DailyRevenueProjection> getMonthlyRevenueTrend(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y') as period, SUM(total_amount) as totalRevenue, COUNT(id) as txCount FROM orders WHERE status = 'PAID' AND created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y') ORDER BY period ASC", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.DailyRevenueProjection> getYearlyRevenueTrend(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT tt.type as ticketCategory, SUM(oi.total_price) as revenue FROM order_items oi JOIN orders o ON oi.order_id = o.id JOIN ticket_types tt ON oi.reference_id = tt.id WHERE oi.item_type = 'TICKET' AND o.status = 'PAID' AND o.created_at BETWEEN :from AND :to GROUP BY tt.type", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.RevenueByTypeProjection> getRevenueByTicketCategory(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT pm.name as ticketCategory, SUM(p.amount) as revenue FROM payments p JOIN payment_methods pm ON p.payment_method_id = pm.id WHERE p.status = 'SUCCESS' AND p.payment_time BETWEEN :from AND :to GROUP BY pm.name", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.RevenueByTypeProjection> getRevenueByPaymentMethod(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

