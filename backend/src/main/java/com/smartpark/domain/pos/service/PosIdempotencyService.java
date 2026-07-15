package com.smartpark.domain.pos.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.pos.entity.PosIdempotencyRequest;
import com.smartpark.domain.pos.repository.PosIdempotencyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PosIdempotencyService {
    static final String SCOPE = "POS_CHECKOUT";
    private final PosIdempotencyRequestRepository repository;
    private final ObjectMapper objectMapper;

    public record Claim(Long id, Optional<PosCheckoutDto.CheckoutResponse> cachedResponse) {}

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Claim claim(String key, String requestHash) {
        LocalDateTime now = LocalDateTime.now();
        int inserted = repository.insertClaim(SCOPE, key, requestHash, now.plusMinutes(5), now);
        PosIdempotencyRequest record = repository.findForUpdate(SCOPE, key).orElseThrow();
        if (!record.getRequestHash().equals(requestHash)) {
            throw new ConflictException("ERR-POS-004", "Idempotency key was already used with a different request.");
        }
        if (inserted == 0 && record.getStatus() == PosIdempotencyRequest.RequestStatus.COMPLETED) {
            try {
                return new Claim(record.getId(), Optional.of(objectMapper.readValue(record.getResponseJson(), PosCheckoutDto.CheckoutResponse.class)));
            } catch (JsonProcessingException ex) {
                throw new IllegalStateException("Stored idempotency response is invalid", ex);
            }
        }
        if (inserted == 0 && record.getStatus() == PosIdempotencyRequest.RequestStatus.PROCESSING
                && record.getExpiresAt().isAfter(now)) {
            throw new ConflictException("ERR-POS-004", "Checkout with this idempotency key is already processing.");
        }
        record.setStatus(PosIdempotencyRequest.RequestStatus.PROCESSING);
        record.setResponseJson(null);
        record.setResourceId(null);
        record.setExpiresAt(now.plusMinutes(5));
        record.setUpdatedAt(now);
        repository.save(record);
        return new Claim(record.getId(), Optional.empty());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void markFailed(Long id) {
        repository.findByIdForUpdate(id).ifPresent(record -> {
            if (record.getStatus() != PosIdempotencyRequest.RequestStatus.COMPLETED) {
                record.setStatus(PosIdempotencyRequest.RequestStatus.FAILED);
                record.setExpiresAt(LocalDateTime.now());
                record.setUpdatedAt(LocalDateTime.now());
                repository.save(record);
            }
        });
    }
}
