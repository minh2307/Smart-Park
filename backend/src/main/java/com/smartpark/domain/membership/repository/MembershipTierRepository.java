package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.MembershipTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipTierRepository extends JpaRepository<MembershipTier, Long> {
    Optional<MembershipTier> findByCode(String code);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM MembershipTier t WHERE t.deletedAt IS NULL " +
           "AND (:search IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "ORDER BY t.sortOrder ASC")
    org.springframework.data.domain.Page<MembershipTier> findAllActive(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("status") MembershipTier.TierStatus status,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM MembershipTier t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<MembershipTier> findByIdAndNotDeleted(@org.springframework.data.repository.query.Param("id") Long id);
}
