package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    List<PointHistory> findByMembershipId(Long membershipId);

    @org.springframework.data.jpa.repository.Query("SELECT ph FROM PointHistory ph WHERE " +
           "(:search IS NULL OR LOWER(ph.membership.membershipCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(ph.membership.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR ph.transactionType = :type) AND " +
           "(:membershipId IS NULL OR ph.membership.id = :membershipId)")
    org.springframework.data.domain.Page<PointHistory> findAllWithFilters(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("type") PointHistory.TransactionType type,
            @org.springframework.data.repository.query.Param("membershipId") Long membershipId,
            org.springframework.data.domain.Pageable pageable);
}
