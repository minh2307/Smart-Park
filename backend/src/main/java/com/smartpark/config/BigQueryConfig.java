package com.smartpark.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.bigquery.BigQuery;
import com.google.cloud.bigquery.BigQueryOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * BigQuery client configuration.
 * Only initialized when app.bigquery.enabled=true (production).
 * In development/test, the bean is absent and BigQueryService uses mock mode.
 */
@Configuration
@Slf4j
public class BigQueryConfig {

    @Value("${app.bigquery.project-id:}")
    private String projectId;

    @Value("${app.bigquery.dataset-id:smartpark_dw}")
    private String datasetId;

    @Value("${GCP_CREDENTIALS_JSON:}")
    private String credentialsJson;

    @Bean
    @ConditionalOnProperty(name = "app.bigquery.enabled", havingValue = "true")
    public BigQuery bigQuery() throws IOException {
        if (credentialsJson == null || credentialsJson.isBlank()) {
            throw new IllegalStateException(
                    "GCP_CREDENTIALS_JSON environment variable is required when app.bigquery.enabled=true");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
        ).createScoped("https://www.googleapis.com/auth/cloud-platform");

        BigQuery bigQuery = BigQueryOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build()
                .getService();

        log.info("[BIGQUERY] Client initialized. project={} dataset={}", projectId, datasetId);
        return bigQuery;
    }
}
