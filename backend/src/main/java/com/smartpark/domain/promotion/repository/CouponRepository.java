package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT c FROM Coupon c WHERE " +
           "(:search IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:promotionId IS NULL OR c.promotion.id = :promotionId) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Coupon> findAllWithFilters(String search, Long promotionId, Coupon.CouponStatus status, Pageable pageable);
}
