package com.smartpark.integration.payment.payos.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "integration.payos")
@Getter
@Setter
public class PayOSProperties {
    private boolean enabled;
    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String returnUrl;
    private String cancelUrl;
    private String webhookUrl;
}
