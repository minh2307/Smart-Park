package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    Optional<CouponUsage> findByCouponIdAndCustomerId(Long couponId, Long customerId);
    boolean existsByCouponIdAndCustomerId(Long couponId, Long customerId);
}
