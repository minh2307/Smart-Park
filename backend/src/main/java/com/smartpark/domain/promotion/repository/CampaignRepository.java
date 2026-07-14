package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    Optional<Campaign> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT c FROM Campaign c WHERE " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:campaignType IS NULL OR c.campaignType = :campaignType) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:startDate IS NULL OR c.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR c.endDate <= :endDate)")
    Page<Campaign> findAllWithFilters(String search, String campaignType, Campaign.CampaignStatus status,
                                      LocalDate startDate, LocalDate endDate, Pageable pageable);
}
