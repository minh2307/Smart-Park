package com.smartpark.integration.payment.payos.repository;

import com.smartpark.integration.payment.payos.entity.WebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WebhookLogRepository extends JpaRepository<WebhookLog, Long> {
    Optional<WebhookLog> findByProviderAndEventId(String provider, String eventId);
}
