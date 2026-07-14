package com.smartpark.integration.payment.payos.service;

import com.smartpark.integration.payment.payos.entity.WebhookLog;
import com.smartpark.integration.payment.payos.repository.WebhookLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class WebhookLogService {

    private final WebhookLogRepository webhookLogRepository;

    @Transactional
    public WebhookLog logReceived(String provider, String eventId, String orderCode, String transactionId, boolean signatureValid) {
        return webhookLogRepository.findByProviderAndEventId(provider, eventId)
                .orElseGet(() -> {
                    WebhookLog log = WebhookLog.builder()
                            .provider(provider)
                            .eventId(eventId)
                            .orderCode(orderCode)
                            .transactionId(transactionId)
                            .signatureValid(signatureValid)
                            .processingStatus(signatureValid ? WebhookLog.ProcessingStatus.PENDING : WebhookLog.ProcessingStatus.FAILED)
                            .build();
                    return webhookLogRepository.save(log);
                });
    }

    @Transactional
    public void markProcessed(Long id) {
        webhookLogRepository.findById(id).ifPresent(log -> {
            log.setProcessingStatus(WebhookLog.ProcessingStatus.PROCESSED);
            log.setProcessedAt(LocalDateTime.now());
            webhookLogRepository.save(log);
        });
    }

    @Transactional
    public void markFailed(Long id) {
        webhookLogRepository.findById(id).ifPresent(log -> {
            log.setProcessingStatus(WebhookLog.ProcessingStatus.FAILED);
            log.setRetryCount(log.getRetryCount() + 1);
            webhookLogRepository.save(log);
        });
    }
    
    @Transactional
    public void markIgnored(Long id) {
        webhookLogRepository.findById(id).ifPresent(log -> {
            log.setProcessingStatus(WebhookLog.ProcessingStatus.IGNORED);
            log.setProcessedAt(LocalDateTime.now());
            webhookLogRepository.save(log);
        });
    }

    @Transactional(readOnly = true)
    public boolean isProcessed(String provider, String eventId) {
        return webhookLogRepository.findByProviderAndEventId(provider, eventId)
                .map(log -> log.getProcessingStatus() == WebhookLog.ProcessingStatus.PROCESSED)
                .orElse(false);
    }
}
