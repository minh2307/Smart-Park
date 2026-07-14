package com.smartpark.integration.payment.payos.service;

import com.smartpark.domain.order.entity.Payment;
import com.smartpark.domain.order.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.PaymentLinkData;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentStatusSynchronizer {

    private final PayOSGateway payOSGateway;
    private final PaymentRepository paymentRepository;
    
    @Transactional
    public void syncStatus(String orderCode) {
        Optional<Payment> optionalPayment = paymentRepository.findByOrderCodeAndProviderAndStatus(orderCode, "PAYOS", Payment.PaymentStatus.PENDING);
        
        if (optionalPayment.isEmpty()) {
            return;
        }
        
        Payment payment = optionalPayment.get();
        try {
            PaymentLinkData linkData = payOSGateway.getPaymentLinkInformation(Long.parseLong(payment.getProviderTransactionId()));
            
            // Just update provider status, rely on Webhook to update core Payment status
            payment.setProviderStatus(linkData.getStatus());
            paymentRepository.save(payment);
            
            log.info("[PAYOS SYNC] Synced status for orderCode={}. Status={}", orderCode, linkData.getStatus());
        } catch (Exception e) {
            log.error("[PAYOS SYNC] Failed to sync status for orderCode={}", orderCode, e);
        }
    }
}
