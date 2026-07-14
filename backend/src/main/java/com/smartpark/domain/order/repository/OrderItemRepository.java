package com.smartpark.domain.order.repository;

import com.smartpark.domain.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.order.status = com.smartpark.domain.order.entity.Order.OrderStatus.PAID AND oi.order.createdAt BETWEEN :from AND :to")
    long countItemsSoldBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT oi.reference_id as itemId, CASE WHEN oi.item_type = 'RETAIL' THEN (SELECT ri.name FROM retail_items ri WHERE ri.id = oi.reference_id) ELSE (SELECT fi.name FROM food_items fi WHERE fi.id = oi.reference_id) END as itemName, SUM(oi.quantity) as totalQuantitySold, SUM(oi.total_price) as totalRevenue FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.item_type IN ('RETAIL', 'FOOD') AND o.status = 'PAID' AND o.created_at BETWEEN :from AND :to GROUP BY oi.reference_id, oi.item_type ORDER BY totalRevenue DESC", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.ProductSalesReportProjection> getProductSalesReport(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

