package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    List<PointHistory> findByMembershipId(Long membershipId);
}
