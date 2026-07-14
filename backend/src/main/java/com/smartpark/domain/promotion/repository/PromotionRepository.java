package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByStatus(Promotion.PromotionStatus status);

    @Query("SELECT p FROM Promotion p WHERE " +
           "(:campaignId IS NULL OR p.campaign.id = :campaignId) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:discountType IS NULL OR p.discountType = :discountType)")
    Page<Promotion> findAllWithFilters(Long campaignId, String search, Promotion.PromotionStatus status, Promotion.DiscountType discountType, Pageable pageable);
}
