package com.smartpark.domain.notification.repository;

import com.smartpark.domain.notification.entity.PushHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PushHistoryRepository extends JpaRepository<PushHistory, Long>, JpaSpecificationExecutor<PushHistory> {
}
