package com.smartpark.domain.bi.repository;

import com.smartpark.domain.bi.entity.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {
    List<ReportHistory> findByExpiresAtBefore(LocalDateTime time);
}
