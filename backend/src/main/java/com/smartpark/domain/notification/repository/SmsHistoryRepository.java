package com.smartpark.domain.notification.repository;

import com.smartpark.domain.notification.entity.SmsHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SmsHistoryRepository extends JpaRepository<SmsHistory, Long>, JpaSpecificationExecutor<SmsHistory> {
}
