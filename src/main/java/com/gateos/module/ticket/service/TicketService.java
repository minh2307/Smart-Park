package com.gateos.module.ticket.service;

import com.gateos.common.exception.BusinessException;
import com.gateos.common.util.QRCodeUtil;
import com.gateos.module.order.entity.Order;
import com.gateos.module.order.entity.OrderItem;
import com.gateos.module.ticket.entity.Ticket;
import com.gateos.module.ticket.repository.TicketRepository;
import com.gateos.module.tickettype.entity.TicketType;
import com.gateos.module.tickettype.repository.TicketTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.redis.ticket-ttl-seconds:2592000}")
    private long ticketTtlSeconds;

    private static final String REDIS_TICKET_PREFIX = "ticket:";

    /**
     * Sinh vé sau khi order PAID (gọi từ PaymentService)
     */
    @Transactional
    public List<Ticket> generateTicketsForOrder(Order order) {
        List<Ticket> tickets = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            TicketType tt = ticketTypeRepository.findById(item.getTicketTypeId()).orElseThrow();
            LocalDate now = LocalDate.now();
            LocalDate validTo = now.plusDays(tt.getValidDays() != null ? tt.getValidDays() : 1);

            for (int i = 0; i < item.getQuantity(); i++) {
                String ticketCode = "GOS-" + tt.getType().name().substring(0, 2) + "-"
                        + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

                Ticket ticket = Ticket.builder()
                        .orderItemId(item.getId())
                        .ticketTypeId(tt.getId())
                        .customerId(order.getCustomerId())
                        .ticketCode(ticketCode)
                        .status(Ticket.TicketStatus.UNUSED)
                        .validFrom(now)
                        .validTo(validTo)
                        .build();

                ticket = ticketRepository.save(ticket);
                tickets.add(ticket);

                // Lưu vào Redis Cache (BR-QR-03)
                cacheTicket(ticket);
                log.info("Generated ticket: {} for order: {}", ticketCode, order.getOrderCode());
            }
        }
        return tickets;
    }

    public void cacheTicket(Ticket ticket) {
        String key = REDIS_TICKET_PREFIX + ticket.getTicketCode();
        redisTemplate.opsForValue().set(key, ticket, ticketTtlSeconds, TimeUnit.SECONDS);
    }

    public Page<Ticket> getMyTickets(Long customerId, Pageable pageable) {
        return ticketRepository.findByCustomerId(customerId, pageable);
    }

    public Ticket getById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Vé không tồn tại", "ERR-TKT-005"));
    }

    public byte[] getQRCodeImage(Long ticketId) {
        Ticket ticket = getById(ticketId);
        return QRCodeUtil.generateQRCodeImage(ticket.getTicketCode());
    }

    /**
     * Lấy thông tin vé từ Redis Cache (dùng cho check-in)
     */
    public Ticket getFromCache(String ticketCode) {
        String key = REDIS_TICKET_PREFIX + ticketCode;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached instanceof Ticket) return (Ticket) cached;
        // Fallback to DB
        return ticketRepository.findByTicketCode(ticketCode).orElse(null);
    }
}
