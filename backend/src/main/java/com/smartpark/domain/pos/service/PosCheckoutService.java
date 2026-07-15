package com.smartpark.domain.pos.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.settings.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PosCheckoutService {
    private final PosIdempotencyService idempotencyService;
    private final PosCheckoutTransactionService transactionService;
    private final ObjectMapper objectMapper;
    private final FeatureFlagService featureFlagService;

    public PosCheckoutDto.CheckoutResponse checkout(String idempotencyKey, PosCheckoutDto.CheckoutRequest request) {
        featureFlagService.requireEnabled(FeatureFlagService.FeatureFlag.POS);
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 100) {
            throw new BusinessException("ERR-POS-004", "A valid Idempotency-Key header is required.");
        }
        PosIdempotencyService.Claim claim = idempotencyService.claim(idempotencyKey.trim(), hash(request));
        if (claim.cachedResponse().isPresent()) return claim.cachedResponse().get();
        try {
            return transactionService.execute(claim.id(), request);
        } catch (RuntimeException ex) {
            idempotencyService.markFailed(claim.id());
            throw ex;
        }
    }

    private String hash(PosCheckoutDto.CheckoutRequest request) {
        try {
            byte[] json = objectMapper.writeValueAsString(request).getBytes(StandardCharsets.UTF_8);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json));
        } catch (JsonProcessingException | NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Cannot hash checkout request", ex);
        }
    }
}
