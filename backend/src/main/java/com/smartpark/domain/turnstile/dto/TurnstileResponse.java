package com.smartpark.domain.turnstile.dto;

import java.time.LocalDateTime;

public record TurnstileResponse(String requestId, Decision decision, Command command,
                                String ticketStatus, String message, LocalDateTime processedAt) {
    public enum Decision { ALLOW, DENY, MANUAL_REVIEW }
    public enum Command { OPEN, KEEP_CLOSED, ALARM }
}
