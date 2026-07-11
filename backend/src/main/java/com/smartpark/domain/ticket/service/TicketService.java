package com.smartpark.domain.ticket.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.repository.NotificationRepository;
import com.smartpark.domain.ticket.entity.CheckIn;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.repository.CheckInRepository;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * TicketService - Business Logic đầy đủ theo SRS.
 *
 * State machine:
 * UNUSED --> USED (check-in)
 * UNUSED --> CANCELLED (cancel)
 * UNUSED --> EXPIRED (scheduler hàng ngày)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final CustomerRepository customerRepository;
    private final CheckInRepository checkInRepository;
    private final NotificationRepository notificationRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    // ─────────────────────────────── QUERIES ───────────────────────────────

    @Transactional(readOnly = true)
    public Page<Ticket> findAll(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Ticket findById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    @Transactional(readOnly = true)
    public Ticket findByCode(String code) {
        return ticketRepository.findByTicketCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", code));
    }

    @Transactional(readOnly = true)
    public Page<Ticket> findByCustomer(Long customerId, Pageable pageable) {
        return ticketRepository.findByCustomerId(customerId, pageable);
    }

    // ─────────────────────────── TICKET FLOW ──────────────────────────────

    /**
     * BR-TKT-01: Reserve tickets (Giữ chỗ)
     */
    @Transactional
    public List<Ticket> reserveTickets(Long customerId, Long ticketTypeId, int quantity, LocalDate validDate) {
        if (quantity <= 0 || quantity > 10) {
            throw new BusinessException("ERR-TKT-010", "Số lượng mua không hợp lệ (1-10 vé).");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        // Dùng Pessimistic Lock để tránh overselling
        TicketType type = ticketTypeRepository.findByIdForUpdate(ticketTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketType", ticketTypeId));

        if (type.getStatus() != TicketType.TicketTypeStatus.ACTIVE) {
            throw new BusinessException("ERR-TKT-001", "Loại vé này hiện không còn bán.");
        }

        if (type.getAvailableQuantity() < quantity) {
            throw new ConflictException("ERR-TKT-011", "Số lượng vé còn lại không đủ.");
        }

        // Trừ số lượng tồn kho
        type.setAvailableQuantity(type.getAvailableQuantity() - quantity);
        ticketTypeRepository.save(type);

        LocalDate effectiveDate = (validDate != null) ? validDate : LocalDate.now();
        List<Ticket> reservedTickets = new ArrayList<>();

        for (int i = 0; i < quantity; i++) {
            Ticket ticket = Ticket.builder()
                    .customer(customer)
                    .ticketType(type)
                    .ticketCode(UUID.randomUUID().toString().replace("-", "").toUpperCase())
                    .status(Ticket.TicketStatus.RESERVED)
                    .validDate(effectiveDate)
                    .build();
            reservedTickets.add(ticketRepository.save(ticket));
        }

        log.info("[TICKETS RESERVED] customerId={} typeId={} quantity={}", customerId, ticketTypeId, quantity);
        return reservedTickets;
    }

    /**
     * Confirm tickets (Thanh toán thành công)
     */
    @Transactional
    public List<Ticket> confirmTickets(List<Long> ticketIds) {
        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("Tickets", ticketIds.toString());
        }

        Customer customer = tickets.get(0).getCustomer();
        for (Ticket t : tickets) {
            if (t.getStatus() != Ticket.TicketStatus.RESERVED) {
                throw new BusinessException("ERR-TKT-012", "Vé " + t.getId() + " không ở trạng thái RESERVED.");
            }
            t.setStatus(Ticket.TicketStatus.PAID);
            
            // Trigger TICKET_PURCHASED
            analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.TICKET_PURCHASED,
                    customer.getId(),
                    "Ticket",
                    t.getId(),
                    t.getTicketType().getStandardPrice(),
                    java.util.Map.of(
                            "ticketId", t.getId(),
                            "ticketType", t.getTicketType().getName()
                    )
            );
        }

        List<Ticket> saved = ticketRepository.saveAll(tickets);

        _sendNotification(customer, "🎫 Vé của bạn đã thanh toán thành công",
                "Bạn đã thanh toán thành công " + tickets.size() + " vé. Chúc vui chơi!");

        log.info("[TICKETS CONFIRMED] ticketIds={}", ticketIds);
        return saved;
    }

    /**
     * Release tickets (Hủy giữ chỗ, trả lại kho)
     */
    @Transactional
    public void releaseTickets(List<Long> ticketIds) {
        List<Ticket> tickets = ticketRepository.findAllById(ticketIds);
        for (Ticket t : tickets) {
            if (t.getStatus() == Ticket.TicketStatus.RESERVED) {
                t.setStatus(Ticket.TicketStatus.CANCELLED);
                ticketRepository.save(t);

                // Trả lại kho
                TicketType type = ticketTypeRepository.findByIdForUpdate(t.getTicketType().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("TicketType", t.getTicketType().getId()));
                type.setAvailableQuantity(type.getAvailableQuantity() + 1);
                ticketTypeRepository.save(type);
            }
        }
        log.info("[TICKETS RELEASED] ticketIds={}", ticketIds);
    }

    // ─────────────────────────────── CHECK-IN ──────────────────────────────

    /**
     * BR-TKT-02: Quét mã QR để check-in tại cổng vào.
     * - Vé phải ở trạng thái UNUSED.
     * - Ngày hôm nay phải <= validDate.
     * - Ghi nhận CheckIn record để phục vụ BI.
     * - Dùng Pessimistic Lock để tránh double check-in trong môi trường concurrent.
     */
    @Transactional
    public CheckIn checkIn(String ticketCode) {
        // Pessimistic write lock để tránh double scan
        Ticket ticket = ticketRepository.findByTicketCodeForUpdate(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketCode));

        // State validation
        if (ticket.getStatus() == Ticket.TicketStatus.USED || ticket.getStatus() == Ticket.TicketStatus.CHECKED_IN) {
            throw new ConflictException("ERR-TKT-002", "Vé này đã được sử dụng hoặc check-in rồi.");
        }
        if (ticket.getStatus() == Ticket.TicketStatus.CANCELLED || ticket.getStatus() == Ticket.TicketStatus.REFUNDED) {
            throw new BusinessException("ERR-TKT-003", "Vé đã bị hủy/hoàn tiền, không thể sử dụng.");
        }
        if (ticket.getStatus() == Ticket.TicketStatus.EXPIRED) {
            throw new BusinessException("ERR-TKT-004", "Vé đã hết hạn.");
        }
        if (ticket.getStatus() != Ticket.TicketStatus.PAID) {
            throw new BusinessException("ERR-TKT-013", "Vé chưa được thanh toán.");
        }

        // Date validation
        if (LocalDate.now().isAfter(ticket.getValidDate())) {
            // Auto-expire nếu chưa được scheduler cập nhật
            ticket.setStatus(Ticket.TicketStatus.EXPIRED);
            ticketRepository.save(ticket);
            throw new BusinessException("ERR-TKT-005",
                    String.format("Vé đã hết hạn. Ngày hợp lệ: %s", ticket.getValidDate()));
        }

        // Mark as CHECKED_IN
        ticket.setStatus(Ticket.TicketStatus.CHECKED_IN);
        ticketRepository.save(ticket);

        // Record CheckIn event (dữ liệu cho BI)
        CheckIn checkIn = CheckIn.builder()
                .ticket(ticket)
                .checkInTime(LocalDateTime.now())
                .build();
        CheckIn saved = checkInRepository.save(checkIn);

        log.info("[CHECK-IN] ticketCode={} customerId={} at={}",
                ticketCode, ticket.getCustomer().getId(), saved.getCheckInTime());

        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.CHECK_IN,
                ticket.getCustomer().getId(), "Ticket", ticket.getId(),
                null, java.util.Map.of(
                        "ticketCode", ticketCode,
                        "ticketType", ticket.getTicketType() != null ? ticket.getTicketType().getName() : ""));

        return saved;
    }

    // ──────────────────────────── CANCEL TICKET ────────────────────────────

    /**
     * BR-TKT-03: Hủy vé/Refund vé.
     * - Chỉ hủy được vé ở trạng thái PAID.
     */
    @Transactional
    public Ticket cancel(String ticketCode, String reason) {
        Ticket ticket = findByCode(ticketCode);

        if (ticket.getStatus() != Ticket.TicketStatus.PAID) {
            throw new BusinessException("ERR-TKT-006",
                    String.format("Không thể hoàn hủy vé ở trạng thái '%s'.", ticket.getStatus()));
        }

        ticket.setStatus(Ticket.TicketStatus.REFUNDED);
        Ticket saved = ticketRepository.save(ticket);

        // Trả lại kho
        TicketType type = ticketTypeRepository.findByIdForUpdate(ticket.getTicketType().getId())
                .orElseThrow(() -> new ResourceNotFoundException("TicketType", ticket.getTicketType().getId()));
        type.setAvailableQuantity(type.getAvailableQuantity() + 1);
        ticketTypeRepository.save(type);

        _sendNotification(ticket.getCustomer(), "❌ Vé đã được hoàn",
                String.format("Vé %s đã được hoàn/hủy. Lý do: %s", ticketCode, reason));

        log.info("[TICKET CANCELLED] ticketCode={} reason={}", ticketCode, reason);

        return saved;
    }

    // ──────────────────────── SCHEDULER: AUTO-EXPIRE ───────────────────────

    /**
     * BR-TKT-07: Tự động expire vé PAID mà đã qua ngày validDate.
     * Chạy mỗi ngày lúc 00:05 sáng.
     */
    @Scheduled(cron = "0 5 0 * * *")
    @SchedulerLock(name = "TicketService_expireTickets", lockAtLeastFor = "1m", lockAtMostFor = "10m")
    @Transactional
    public void expireTickets() {
        List<Ticket> expiredTickets = ticketRepository
                .findByStatusAndValidDateBefore(Ticket.TicketStatus.PAID, LocalDate.now());

        expiredTickets.forEach(t -> t.setStatus(Ticket.TicketStatus.EXPIRED));
        ticketRepository.saveAll(expiredTickets);

        log.info("[TICKET EXPIRE] {} vé đã tự động hết hạn.", expiredTickets.size());
    }

    // ─────────────────────────────── HELPERS ───────────────────────────────

    private void _sendNotification(Customer customer, String title, String message) {
        try {
            Notification notification = Notification.builder()
                    .userId(customer.getId()) // customer.id used as user reference for BI
                    .title(title)
                    .content(message)
                    .type(Notification.NotificationType.IN_APP)
                    .status(Notification.NotificationStatus.PENDING)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Notification không được phép làm fail luồng chính
            log.warn("[NOTIFICATION FAIL] customerId={} title={} error={}",
                    customer.getId(), title, e.getMessage());
        }
    }
}
