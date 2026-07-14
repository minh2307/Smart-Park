package com.smartpark.domain.notification.repository;

import com.smartpark.domain.notification.entity.EmailHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailHistoryRepository extends JpaRepository<EmailHistory, Long>, JpaSpecificationExecutor<EmailHistory> {
    List<EmailHistory> findBySendStatus(EmailHistory.SendStatus sendStatus);
}
