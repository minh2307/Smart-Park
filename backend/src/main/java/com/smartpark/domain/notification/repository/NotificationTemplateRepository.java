package com.smartpark.domain.notification.repository;

import com.smartpark.domain.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long>, JpaSpecificationExecutor<NotificationTemplate> {
    boolean existsByTemplateCode(String templateCode);
    Optional<NotificationTemplate> findByTemplateCode(String templateCode);
    Optional<NotificationTemplate> findByTemplateCodeAndActiveTrue(String templateCode);
}
