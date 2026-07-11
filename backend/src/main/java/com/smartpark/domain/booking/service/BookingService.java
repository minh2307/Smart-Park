package com.smartpark.domain.booking.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.booking.dto.BookingRequest;
import com.smartpark.domain.booking.entity.Booking;
import com.smartpark.domain.booking.repository.BookingRepository;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.repository.NotificationRepository;
import com.smartpark.domain.membership.service.MembershipService;
import com.smartpark.domain.promotion.service.PromotionService;
import com.smartpark.domain.ticket.entity.Ticket;
import com.smartpark.domain.ticket.entity.TicketType;
import com.smartpark.domain.ticket.repository.TicketRepository;
import com.smartpark.domain.ticket.repository.TicketTypeRepository;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;
    private final TicketService ticketService;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketRepository ticketRepository;
    private final StringRedisTemplate redisTemplate;
    private final PromotionService promotionService;
    private final MembershipService membershipService;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    private static final int BOOKING_EXPIRY_MINUTES = 15;

    @Transactional(readOnly = true)
    public Page<Booking> findAll(Pageable pageable) { return bookingRepository.findAll(pageable); }

    @Transactional(readOnly = true)
    public Booking findById(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking", id));
    }

    @Transactional(readOnly = true)
    public Booking findByCode(String code) {
        return bookingRepository.findByBookingCode(code).orElseThrow(() -> new ResourceNotFoundException("Booking", code));
    }

    @Transactional(readOnly = true)
    public Page<Booking> findByCustomer(Long customerId, Pageable pageable) {
        return bookingRepository.findByCustomerId(customerId, pageable);
    }

    // ─────────────────────────── CREATE BOOKING ────────────────────────────

    @Transactional
    public Booking createBooking(BookingRequest request, String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String redisKey = "idempotency:booking:" + idempotencyKey;
            Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSING", Duration.ofHours(24));
            if (Boolean.FALSE.equals(isNew)) {
                throw new ConflictException("ERR-BOOK-010", "Request trùng lặp (Idempotency check failed).");
            }
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        long pendingCount = bookingRepository.countByCustomerIdAndStatus(customer.getId(), Booking.BookingStatus.PENDING);
        if (pendingCount >= 3) {
            throw new ConflictException("ERR-BOOK-001", "Bạn đang có quá nhiều booking chưa thanh toán.");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (BookingRequest.TicketRequest tr : request.getTickets()) {
            TicketType type = ticketTypeRepository.findById(tr.getTicketTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("TicketType", tr.getTicketTypeId()));
            totalAmount = totalAmount.add(type.getStandardPrice().multiply(BigDecimal.valueOf(tr.getQuantity())));
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(request.getCouponCode(), customer.getId(), totalAmount);
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        String bookingCode = "BK-" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 10);

        Booking booking = Booking.builder()
                .customer(customer)
                .bookingCode(bookingCode)
                .totalAmount(finalAmount) // Lưu số tiền đã trừ khuyến mãi
                .discountAmount(discountAmount)
                .couponCode(request.getCouponCode())
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(Booking.PaymentStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusMinutes(BOOKING_EXPIRY_MINUTES))
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Giữ vé (Reservation)
        for (BookingRequest.TicketRequest tr : request.getTickets()) {
            List<Ticket> reservedTickets = ticketService.reserveTickets(customer.getId(), tr.getTicketTypeId(), tr.getQuantity(), request.getValidDate());
            reservedTickets.forEach(t -> t.setBooking(savedBooking));
            ticketRepository.saveAll(reservedTickets);
        }

        log.info("[BOOKING CREATED] code={} customerId={} total={}", bookingCode, customer.getId(), totalAmount);

        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.BOOKING_CREATED,
                customer.getId(), "Booking", savedBooking.getId(),
                finalAmount,
                java.util.Map.of("bookingCode", bookingCode, "coupon", request.getCouponCode() != null ? request.getCouponCode() : ""));

        return savedBooking;
    }

    // ──────────────────────── CONFIRM PAYMENT ──────────────────────────────

    @Transactional
    public Booking confirmPayment(String bookingCode) {
        Booking booking = findByCode(bookingCode);

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BusinessException("ERR-BOOK-002", "Không thể xác nhận booking ở trạng thái " + booking.getStatus());
        }

        booking.setStatus(Booking.BookingStatus.PAID);
        booking.setPaymentStatus(Booking.PaymentStatus.PAID);
        Booking saved = bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        List<Long> ticketIds = tickets.stream().map(Ticket::getId).collect(Collectors.toList());
        ticketService.confirmTickets(ticketIds);

        // Ghi nhận sử dụng mã giảm giá
        if (booking.getCouponCode() != null && !booking.getCouponCode().isBlank()) {
            promotionService.recordCouponUsage(booking.getCouponCode(), booking.getCustomer().getId(), booking.getId());
        }

        // Tích điểm & thăng hạng
        membershipService.addPointsAndCheckTier(booking.getCustomer().getId(), booking.getId(), booking.getTotalAmount());

        _sendNotification(booking.getCustomer().getId(), "✅ Đặt chỗ thành công!",
                String.format("Booking %s đã xác nhận. Tổng tiền: %,.0f VNĐ", bookingCode, booking.getTotalAmount()));

        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.PAYMENT_COMPLETED,
                booking.getCustomer().getId(), "Booking", booking.getId(),
                booking.getTotalAmount(),
                java.util.Map.of("bookingCode", bookingCode));

        log.info("[BOOKING CONFIRMED] code={}", bookingCode);
        return saved;
    }

    // ────────────────────────── CANCEL BOOKING ─────────────────────────────

    @Transactional
    public Booking cancel(String bookingCode, String reason) {
        Booking booking = findByCode(bookingCode);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new ConflictException("ERR-BOOK-004", "Booking đã bị hủy rồi.");
        }
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new ConflictException("ERR-BOOK-005", "Không thể hủy booking đã hoàn thành.");
        }

        boolean isPaid = booking.getStatus() == Booking.BookingStatus.PAID;
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (isPaid) {
            booking.setPaymentStatus(Booking.PaymentStatus.REFUNDED);
        }
        Booking saved = bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        if (!tickets.isEmpty()) {
            List<Long> ticketIds = tickets.stream().map(Ticket::getId).collect(Collectors.toList());
            ticketService.releaseTickets(ticketIds);
        }

        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.BOOKING_CANCELLED,
                booking.getCustomer().getId(), "Booking", booking.getId(),
                null, java.util.Map.of("reason", reason != null ? reason : ""));

        log.info("[BOOKING CANCELLED] code={} reason={}", bookingCode, reason);
        return saved;
    }

    // ──────────────────── SCHEDULER: AUTO-EXPIRE ───────────────────────────

    @Scheduled(fixedDelay = 60_000)
    @SchedulerLock(name = "BookingService_expireOverdueBookings", lockAtLeastFor = "30s", lockAtMostFor = "2m")
    @Transactional
    public void expireOverdueBookings() {
        List<Booking> overdue = bookingRepository
                .findByStatusAndExpiresAtBefore(Booking.BookingStatus.PENDING, LocalDateTime.now());

        for (Booking b : overdue) {
            b.setStatus(Booking.BookingStatus.EXPIRED);
            bookingRepository.save(b);
            
            List<Ticket> tickets = ticketRepository.findByBookingId(b.getId());
            if (!tickets.isEmpty()) {
                List<Long> ticketIds = tickets.stream().map(Ticket::getId).collect(Collectors.toList());
                ticketService.releaseTickets(ticketIds);
            }
            analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.BOOKING_EXPIRED,
                    null, "Booking", b.getId(), null, null);
            log.info("[BOOKING EXPIRED] code={}", b.getBookingCode());
        }
    }

    // ─────────────────────────────── HELPERS ───────────────────────────────

    public Booking updateStatus(Long id, Booking.BookingStatus newStatus) {
        Booking booking = findById(id);
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    private void _sendNotification(Long userId, String title, String message) {
        try {
            Notification notification = Notification.builder()
                    .userId(userId).title(title).content(message)
                    .type(Notification.NotificationType.IN_APP)
                    .status(Notification.NotificationStatus.PENDING).build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("[NOTIFY FAIL] userId={} error={}", userId, e.getMessage());
        }
    }
}
