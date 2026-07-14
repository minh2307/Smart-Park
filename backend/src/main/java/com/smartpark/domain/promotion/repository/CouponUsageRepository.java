package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    Optional<CouponUsage> findByCouponIdAndCustomerId(Long couponId, Long customerId);
    boolean existsByCouponIdAndCustomerId(Long couponId, Long customerId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(cu) FROM CouponUsage cu WHERE cu.usedAt BETWEEN :from AND :to")
    long countUsagesBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT c.id as couponId, c.code as couponCode, COUNT(cu.id) as totalUses, COALESCE(SUM(c.discount_amount), 0) as totalDiscountAmount FROM coupon_usages cu JOIN coupons c ON cu.coupon_id = c.id WHERE cu.used_at BETWEEN :from AND :to GROUP BY c.id, c.code ORDER BY totalUses DESC", nativeQuery = true)
    java.util.List<com.smartpark.domain.bi.projection.CouponPerformanceProjection> getCouponPerformanceReport(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

