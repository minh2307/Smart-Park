package com.smartpark.domain.bi.repository;

import com.smartpark.domain.bi.entity.ExportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExportHistoryRepository extends JpaRepository<ExportHistory, Long> {
    List<ExportHistory> findByExpiresAtBefore(LocalDateTime time);
}
