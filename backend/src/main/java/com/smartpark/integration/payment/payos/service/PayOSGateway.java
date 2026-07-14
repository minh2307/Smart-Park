package com.smartpark.integration.payment.payos.service;

import com.smartpark.integration.payment.payos.config.PayOSProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.WebhookData;
import vn.payos.type.Webhook;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSGateway {

    private final PayOS payOS;
    private final PayOSProperties properties;

    public CheckoutResponseData createPaymentLink(long orderCode, int amount, String description, List<ItemData> items) {
        try {
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .items(items)
                    .returnUrl(properties.getReturnUrl())
                    .cancelUrl(properties.getCancelUrl())
                    .build();

            return payOS.createPaymentLink(paymentData);
        } catch (Exception e) {
            log.error("Error creating PayOS payment link: ", e);
            throw new RuntimeException("Failed to create PayOS payment link", e);
        }
    }

    public vn.payos.type.PaymentLinkData getPaymentLinkInformation(long orderCode) {
        try {
            return payOS.getPaymentLinkInformation(orderCode);
        } catch (Exception e) {
            log.error("Error getting PayOS payment link info: ", e);
            throw new RuntimeException("Failed to get PayOS payment link info", e);
        }
    }

    public vn.payos.type.PaymentLinkData cancelPaymentLink(long orderCode, String cancellationReason) {
        try {
            return payOS.cancelPaymentLink(orderCode, cancellationReason);
        } catch (Exception e) {
            log.error("Error cancelling PayOS payment link: ", e);
            throw new RuntimeException("Failed to cancel PayOS payment link", e);
        }
    }

    public WebhookData verifyWebhookData(Webhook webhook) {
        try {
            return payOS.verifyPaymentWebhookData(webhook);
        } catch (Exception e) {
            log.error("Error verifying PayOS webhook data: ", e);
            throw new RuntimeException("Failed to verify PayOS webhook data", e);
        }
    }
}
