package com.smartpark.domain.turnstile.service;

import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.device.repository.IoTDeviceRepository;
import com.smartpark.domain.device.service.ReplayProtectionService;
import com.smartpark.domain.park.entity.Zone;
import com.smartpark.domain.park.repository.ZoneRepository;
import com.smartpark.domain.parking.entity.Gate;
import com.smartpark.domain.ticket.entity.CheckIn;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.turnstile.dto.TurnstileRequest;
import com.smartpark.domain.turnstile.dto.TurnstileResponse;
import com.smartpark.domain.turnstile.entity.TurnstileScanEvent;
import com.smartpark.domain.turnstile.repository.TurnstileScanEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;

@Service
@RequiredArgsConstructor
public class TurnstileService {
    private final IoTDeviceRepository deviceRepository;
    private final TicketRepository ticketRepository;
    private final CheckInRepository checkInRepository;
    private final ZoneRepository zoneRepository;
    private final TurnstileScanEventRepository eventRepository;
    private final ReplayProtectionService replayProtection;
    private final AuditLogService auditLogService;
    private final com.smartpark.domain.settings.service.FeatureFlagService featureFlags;
    private final com.smartpark.domain.device.service.DeviceRateLimitService deviceRateLimit;

    @Transactional
    public TurnstileResponse process(TurnstileRequest request) {
        long started = System.nanoTime();
        featureFlags.requireEnabled(com.smartpark.domain.settings.service.FeatureFlagService.FeatureFlag.TURNSTILE);
        IoTDevice device = deviceRepository.findByDeviceCode(request.deviceId()).orElse(null);
        TurnstileResponse deniedDevice = validateDevice(device, request);
        deviceRateLimit.check(request.deviceId());
        if (deniedDevice != null) {
            auditLogService.create(AuditLog.builder().action("DEVICE_DENIED").targetTable("iot_devices")
                    .newValues("{\"device\":\"" + request.deviceId() + "\"}").build());
            return deniedDevice;
        }

        var existing = eventRepository.findByDeviceDeviceCodeAndRequestId(request.deviceId(), request.requestId());
        if (existing.isPresent()) return response(existing.get());
        replayProtection.claim("turnstile", request.deviceId(), request.requestId(), Duration.ofHours(24));

        Ticket ticket = ticketRepository.findByTicketCodeForUpdate(request.ticketCode()).orElse(null);
        String error = null;
        String message = "Ticket accepted";
        if (ticket == null) { error = "ERR-GATE-001"; message = "Invalid ticket"; }
        else if (ticket.getTicketType().getPark().getId().longValue() != request.parkId()) {
            error = "ERR-GATE-004"; message = "Ticket is not valid for this park";
        } else if (ticket.getStatus() == Ticket.TicketStatus.USED || ticket.getStatus() == Ticket.TicketStatus.CHECKED_IN) {
            error = "ERR-GATE-002"; message = "Ticket already used";
        } else if (ticket.getStatus() != Ticket.TicketStatus.PAID && ticket.getStatus() != Ticket.TicketStatus.AVAILABLE) {
            error = "ERR-GATE-001"; message = "Ticket is not usable";
        } else if (ticket.getValidDate() == null || !ticket.getValidDate().equals(LocalDate.now())) {
            error = "ERR-GATE-001"; message = "Ticket is outside its valid date";
        }

        Zone zone = null;
        if (error == null && request.zoneId() != null) {
            zone = zoneRepository.findById(request.zoneId()).orElse(null);
            if (zone == null || zone.getPark().getId().longValue() != request.parkId()
                    || zone.getStatus() != Zone.ZoneStatus.ACTIVE) {
                error = "ERR-GATE-004"; message = "Zone is unavailable";
            }
        }

        boolean allow = error == null;
        if (allow) {
            ticket.setStatus(Ticket.TicketStatus.CHECKED_IN);
            checkInRepository.save(CheckIn.builder().ticket(ticket).zone(zone)
                    .scannerId(device.getDeviceCode()).checkInTime(LocalDateTime.now()).build());
        }
        TurnstileScanEvent event = TurnstileScanEvent.builder().device(device).ticket(ticket)
                .requestId(request.requestId()).ticketCode(request.ticketCode()).parkId(request.parkId())
                .zoneId(request.zoneId()).decision(allow ? "ALLOW" : "DENY")
                .command(allow ? "OPEN" : "KEEP_CLOSED")
                .ticketStatus(ticket == null ? null : ticket.getStatus().name()).errorCode(error).message(message)
                .scanTime(request.scanTime()).processedAt(LocalDateTime.now()).latencyMs(elapsed(started)).build();
        try { eventRepository.saveAndFlush(event); }
        catch (DataIntegrityViolationException race) {
            return eventRepository.findByDeviceDeviceCodeAndRequestId(request.deviceId(), request.requestId())
                    .map(this::response).orElseThrow(() -> race);
        }
        audit(device, event);
        return response(event);
    }

    private TurnstileResponse validateDevice(IoTDevice device, TurnstileRequest request) {
        boolean invalid = device == null || device.getStatus() != IoTDevice.DeviceStatus.ACTIVE
                || device.getDeviceType() != IoTDevice.DeviceType.TURNSTILE
                || device.getPark().getId().longValue() != request.parkId()
                || (device.getZone() != null && !device.getZone().getId().equals(request.zoneId()))
                || (device.getGate() != null && device.getGate().getStatus() != Gate.GateStatus.OPEN);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!invalid && auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("DEVICE_TURNSTILE")))
            invalid = !auth.getName().equals("device:" + request.deviceId());
        if (!invalid) return null;
        return new TurnstileResponse(request.requestId(), TurnstileResponse.Decision.DENY,
                TurnstileResponse.Command.KEEP_CLOSED, null, "Device unauthorized or unavailable", LocalDateTime.now());
    }

    private void audit(IoTDevice d, TurnstileScanEvent e) {
        auditLogService.create(AuditLog.builder().action("GATE_DECISION").targetTable("turnstile_scan_events")
                .recordId(e.getId()).newValues("{\"device\":\"" + d.getDeviceCode() + "\",\"decision\":\"" + e.getDecision() + "\"}")
                .build());
    }
    private long elapsed(long start) { return (System.nanoTime() - start) / 1_000_000; }
    private TurnstileResponse response(TurnstileScanEvent e) {
        return new TurnstileResponse(e.getRequestId(), TurnstileResponse.Decision.valueOf(e.getDecision()),
                TurnstileResponse.Command.valueOf(e.getCommand()), e.getTicketStatus(), e.getMessage(), e.getProcessedAt());
    }
}
