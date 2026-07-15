package com.smartpark.domain.turnstile.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record TurnstileRequest(
        @NotBlank @Size(max = 80) String deviceId,
        @NotBlank @Size(max = 100) String ticketCode,
        @NotNull @Positive Long parkId,
        @Positive Long zoneId,
        @NotNull @PastOrPresent LocalDateTime scanTime,
        @NotBlank @Size(max = 64) String requestId) {}
