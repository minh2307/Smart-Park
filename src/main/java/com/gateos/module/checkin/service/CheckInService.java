package com.gateos.module.checkin.service;

import com.gateos.module.checkin.entity.CheckIn;
import com.gateos.module.checkin.repository.CheckInRepository;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.repository.TicketRepository;
import com.gateos.module.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.redis.cooldown-ttl-seconds:10}")
    private long cooldownTtlSeconds;

    private static final String REDIS_TICKET_PREFIX = "ticket:";
    private static final String REDIS_COOLDOWN_PREFIX = "checkin:cooldown:";

    /**
     * Xử lý quét QR soát vé (BR-CHK-01 → BR-CHK-04)
     */
    @Transactional
    public Map<String, Object> scan(String ticketCode, Long gateStaffId, Long attractionId) {
        // BR-CHK-03: Chống quét trùng trong 10 giây
        String cooldownKey = REDIS_COOLDOWN_PREFIX + ticketCode;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            return buildResult(false, "DUPLICATE_SCAN", "Vé đã được quét trong 10 giây gần đây", null);
        }

        // Set cooldown
        redisTemplate.opsForValue().set(cooldownKey, "1", cooldownTtlSeconds, TimeUnit.SECONDS);

        // BR-CHK-02: Ưu tiên tra cứu Redis Cache (< 200ms)
        Ticket ticket = ticketService.getFromCache(ticketCode);

        if (ticket == null) {
            // Fallback to DB
            ticket = ticketRepository.findByTicketCode(ticketCode).orElse(null);
        }

        if (ticket == null) {
            logCheckIn(null, gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "NOT_FOUND");
            return buildResult(false, "NOT_FOUND", "Vé không tồn tại trong hệ thống", null);
        }

        // Check status
        if (ticket.getStatus() == Ticket.TicketStatus.USED) {
            logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "ALREADY_USED");
            return buildResult(false, "ALREADY_USED", "Vé đã được sử dụng", ticket);
        }
        if (ticket.getStatus() == Ticket.TicketStatus.EXPIRED) {
            logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "EXPIRED");
            return buildResult(false, "EXPIRED", "Vé đã hết hạn sử dụng", ticket);
        }
        if (ticket.getStatus() == Ticket.TicketStatus.REFUNDED) {
            logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "REFUNDED");
            return buildResult(false, "REFUNDED", "Vé đã được hoàn tiền", ticket);
        }

        // Check validity date
        LocalDate today = LocalDate.now();
        if (ticket.getValidTo() != null && today.isAfter(ticket.getValidTo())) {
            logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "EXPIRED");
            return buildResult(false, "EXPIRED", "Vé đã hết hạn sử dụng", ticket);
        }
        if (ticket.getValidFrom() != null && today.isBefore(ticket.getValidFrom())) {
            logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.FAILED, "NOT_YET_VALID");
            return buildResult(false, "NOT_YET_VALID", "Vé chưa đến ngày sử dụng", ticket);
        }

        // ✅ VÉ HỢP LỆ — Cập nhật trạng thái
        ticket.setStatus(Ticket.TicketStatus.USED);
        ticketRepository.save(ticket);

        // Cập nhật Redis Cache
        String redisKey = REDIS_TICKET_PREFIX + ticketCode;
        redisTemplate.delete(redisKey); // Xóa khỏi active cache

        logCheckIn(ticket.getId(), gateStaffId, attractionId, CheckIn.CheckInStatus.SUCCESS, null);
        log.info("Check-in SUCCESS: ticket={}", ticketCode);

        return buildResult(true, "SUCCESS", "Vé hợp lệ - Mở cổng", ticket);
    }

    /**
     * Mở cổng cưỡng bức (Override) theo yêu cầu Gate Staff / Admin
     */
    @Transactional
    public Map<String, Object> manualOverride(String ticketCode, Long gateStaffId, String reason) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode).orElse(null);
        logCheckIn(ticket != null ? ticket.getId() : null, gateStaffId, null,
                CheckIn.CheckInStatus.SUCCESS, "MANUAL_OVERRIDE: " + reason);
        return buildResult(true, "OVERRIDE", "Mở cổng cưỡng bức thành công", ticket);
    }

    public Page<CheckIn> getHistory(Pageable pageable) {
        return checkInRepository.findAll(pageable);
    }

    // =================== HELPERS ===================

    private void logCheckIn(Long ticketId, Long gateStaffId, Long attractionId,
                            CheckIn.CheckInStatus status, String failureReason) {
        CheckIn log = CheckIn.builder()
                .ticketId(ticketId)
                .gateStaffId(gateStaffId)
                .attractionId(attractionId)
                .checkInTime(LocalDateTime.now())
                .status(status)
                .failureReason(failureReason)
                .build();
        checkInRepository.save(log);
    }

    private Map<String, Object> buildResult(boolean success, String code, String message, Ticket ticket) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        result.put("code", code);
        result.put("message", message);
        result.put("openGate", success);
        if (ticket != null) {
            Map<String, Object> ticketInfo = new HashMap<>();
            ticketInfo.put("ticketCode", ticket.getTicketCode());
            ticketInfo.put("status", ticket.getStatus());
            ticketInfo.put("validTo", ticket.getValidTo());
            result.put("ticketInfo", ticketInfo);
        }
        return result;
    }
}
