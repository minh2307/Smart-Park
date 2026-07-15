package com.smartpark.domain.pos.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.*;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.repository.AuditLogRepository;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.food.entity.*;
import com.smartpark.domain.food.repository.FoodItemRepository;
import com.smartpark.domain.inventory.service.InventoryService;
import com.smartpark.domain.order.entity.*;
import com.smartpark.domain.order.repository.*;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.pos.entity.*;
import com.smartpark.domain.pos.repository.*;
import com.smartpark.domain.promotion.service.PromotionService;
import com.smartpark.domain.retail.entity.*;
import com.smartpark.domain.ticket.entity.*;
import com.smartpark.domain.ticket.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PosCheckoutTransactionService {
    private final PosTerminalRepository terminalRepository;
    private final PosIdempotencyRequestRepository idempotencyRepository;
    private final CustomerRepository customerRepository;
    private final FoodItemRepository foodItemRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketRepository ticketRepository;
    private final InventoryService inventoryService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PromotionService promotionService;
    private final AuditLogRepository auditLogRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.pos.tax-rate:0.10}")
    private BigDecimal taxRate;

    private record Resolved(PosCheckoutDto.ItemType type, Long id, String sku, String name, int quantity,
                            BigDecimal unitPrice, RetailItem retailItem, TicketType ticketType) {}

    @Transactional
    public PosCheckoutDto.CheckoutResponse execute(Long idempotencyId, PosCheckoutDto.CheckoutRequest request) {
        PosIdempotencyRequest idempotency = idempotencyRepository.findByIdForUpdate(idempotencyId)
                .orElseThrow(() -> new ConflictException("ERR-POS-004", "Idempotency claim no longer exists."));
        if (idempotency.getStatus() != PosIdempotencyRequest.RequestStatus.PROCESSING) {
            throw new ConflictException("ERR-POS-004", "Idempotency claim is not processable.");
        }

        PosTerminal terminal = terminalRepository.findByCodeForUpdate(request.getTerminalId())
                .orElseThrow(() -> new BusinessException("ERR-POS-001", "POS terminal not found."));
        if (terminal.getStatus() != PosTerminal.TerminalStatus.ACTIVE
                || !terminal.getPark().getId().equals(request.getParkId())) {
            throw new BusinessException("ERR-POS-001", "POS terminal is inactive or belongs to another park.");
        }
        Customer customer = customerRepository.findById(request.getCustomerId())
                .filter(c -> c.getStatus() == Customer.CustomerStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("ERR-POS-002", "Customer is unavailable."));
        PaymentMethod method = paymentMethodRepository.findActiveCandidateForCheckout(request.getPaymentMethodCode())
                .orElseThrow(() -> new BusinessException("ERR-POS-005", "Payment method not found."));
        if (method.getStatus() != PaymentMethod.PaymentMethodStatus.ACTIVE
                || !("CASH".equalsIgnoreCase(method.getCode()) || "CASH_POS".equalsIgnoreCase(method.getCode()))) {
            throw new BusinessException("ERR-POS-005", "Only an active CASH payment method is supported by synchronous POS checkout.");
        }

        List<PosCheckoutDto.ItemRequest> sorted = request.getItems().stream()
                .sorted(Comparator.comparing((PosCheckoutDto.ItemRequest i) -> i.getItemType().name())
                        .thenComparing(PosCheckoutDto.ItemRequest::getReferenceId)).toList();
        Set<String> distinct = new HashSet<>();
        List<Resolved> resolved = new ArrayList<>();
        for (PosCheckoutDto.ItemRequest item : sorted) {
            String itemKey = item.getItemType() + ":" + item.getReferenceId();
            if (!distinct.add(itemKey)) throw new BusinessException("ERR-POS-002", "Duplicate cart item: " + itemKey);
            resolved.add(resolve(item, request.getParkId()));
        }

        BigDecimal subtotal = resolved.stream()
                .map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            discount = promotionService.validateAndCalculateDiscount(
                    request.getCouponCode().trim(), customer.getId(), subtotal).setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = taxable.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).setScale(2, RoundingMode.HALF_UP);
        LocalDateTime now = LocalDateTime.now();
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        String orderCode = "ORD-" + now.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + suffix;
        String receiptNumber = "REC-" + now.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + suffix;

        Order order = Order.builder().customer(customer).orderCode(orderCode).parkId(request.getParkId())
                .terminalId(terminal.getId()).receiptNumber(receiptNumber).subtotal(subtotal)
                .discountAmount(discount).taxAmount(tax).totalAmount(total).status(Order.OrderStatus.PAID).build();
        List<OrderItem> orderItems = new ArrayList<>();
        for (Resolved item : resolved) {
            orderItems.add(OrderItem.builder().order(order)
                    .itemType(item.type().name()).referenceId(item.id()).itemSku(item.sku()).itemName(item.name())
                    .quantity(item.quantity()).unitPrice(item.unitPrice())
                    .totalPrice(item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())).setScale(2, RoundingMode.HALF_UP)).build());
        }
        order.setItems(new ArrayList<>(orderItems));
        order = orderRepository.saveAndFlush(order);

        Long actorId = currentUserId();
        for (int index = 0; index < resolved.size(); index++) {
            Resolved item = resolved.get(index);
            OrderItem orderItem = order.getItems().get(index);
            if (item.retailItem() != null) {
                inventoryService.consumeLocked(item.retailItem(), item.quantity(), order.getId(), actorId);
            } else if (item.ticketType() != null) {
                item.ticketType().setAvailableQuantity(item.ticketType().getAvailableQuantity() - item.quantity());
                ticketTypeRepository.save(item.ticketType());
                for (int count = 0; count < item.quantity(); count++) {
                    ticketRepository.save(Ticket.builder().orderItemId(orderItem.getId()).ticketType(item.ticketType())
                            .customer(customer).ticketCode(UUID.randomUUID().toString().replace("-", "").toUpperCase())
                            .status(Ticket.TicketStatus.PAID).validDate(LocalDate.now()).build());
                }
            }
        }
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            promotionService.recordCouponUsage(request.getCouponCode().trim(), customer.getId(), null);
        }

        Payment payment = paymentRepository.save(Payment.builder().order(order).paymentMethod(method).amount(total)
                .status(Payment.PaymentStatus.SUCCESS).paymentTime(now).paidAt(now).provider("CASH")
                .transactionReference("POS-" + suffix).orderCode(orderCode).providerStatus("CAPTURED").build());
        terminal.setLastSeenAt(now);
        terminalRepository.save(terminal);

        auditLogRepository.save(AuditLog.builder().userId(actorId).action("CREATE").targetTable("orders")
                .recordId(order.getId()).newValues(json(Map.of("orderCode", orderCode, "terminalCode", terminal.getTerminalCode(),
                        "totalAmount", total, "paymentId", payment.getId()))).build());
        analyticsEventPublisher.publish(AnalyticsEvent.EventType.PAYMENT_COMPLETED, customer.getId(), "Order",
                order.getId(), total, Map.of("channel", "POS", "terminalId", terminal.getTerminalCode(), "receiptNumber", receiptNumber));

        PosCheckoutDto.CheckoutResponse response = PosCheckoutDto.CheckoutResponse.builder()
                .orderId(order.getId()).orderCode(orderCode).paymentId(payment.getId()).paymentStatus(payment.getStatus().name())
                .subtotal(subtotal).discountAmount(discount).taxAmount(tax).totalAmount(total)
                .receiptNumber(receiptNumber).createdAt(order.getCreatedAt() != null ? order.getCreatedAt() : now).build();
        idempotency.setStatus(PosIdempotencyRequest.RequestStatus.COMPLETED);
        idempotency.setResponseJson(json(response));
        idempotency.setResourceId(order.getId());
        idempotency.setExpiresAt(now.plusHours(24));
        idempotency.setUpdatedAt(now);
        idempotencyRepository.save(idempotency);
        return response;
    }

    private Resolved resolve(PosCheckoutDto.ItemRequest item, Long parkId) {
        return switch (item.getItemType()) {
            case RETAIL -> {
                if (item.getSku() == null || item.getSku().isBlank())
                    throw new BusinessException("ERR-POS-002", "SKU is required for retail items.");
                RetailItem retail = inventoryService.lockBySku(item.getSku());
                if (!retail.getId().equals(item.getReferenceId()) || retail.getStatus() != RetailItem.RetailItemStatus.ACTIVE
                        || !retail.getRetailShop().getPark().getId().equals(parkId))
                    throw new BusinessException("ERR-POS-002", "Retail product is unavailable or belongs to another park.");
                int available = retail.getStockQuantity() - retail.getReservedQuantity();
                if (available < item.getQuantity()) throw new ConflictException("ERR-POS-003", "Insufficient retail stock.");
                yield new Resolved(item.getItemType(), retail.getId(), retail.getSku(), retail.getName(),
                        item.getQuantity(), retail.getPrice(), retail, null);
            }
            case FOOD -> {
                FoodItem food = foodItemRepository.findById(item.getReferenceId())
                        .orElseThrow(() -> new ResourceNotFoundException("FoodItem", item.getReferenceId()));
                FoodStall stall = food.getFoodStall();
                if (food.getStatus() != FoodItem.FoodItemStatus.AVAILABLE
                        || stall.getStatus() != FoodStall.FoodStallStatus.ACTIVE
                        || !stall.getFoodCourt().getPark().getId().equals(parkId))
                    throw new BusinessException("ERR-POS-002", "Food item is unavailable or belongs to another park.");
                yield new Resolved(item.getItemType(), food.getId(), null, food.getName(), item.getQuantity(), food.getPrice(), null, null);
            }
            case TICKET -> {
                TicketType ticketType = ticketTypeRepository.findByIdForUpdate(item.getReferenceId())
                        .orElseThrow(() -> new ResourceNotFoundException("TicketType", item.getReferenceId()));
                if (ticketType.getStatus() != TicketType.TicketTypeStatus.ACTIVE || !ticketType.getPark().getId().equals(parkId))
                    throw new BusinessException("ERR-POS-002", "Ticket type is unavailable or belongs to another park.");
                if (ticketType.getAvailableQuantity() < item.getQuantity())
                    throw new ConflictException("ERR-POS-003", "Insufficient ticket inventory.");
                yield new Resolved(item.getItemType(), ticketType.getId(), null, ticketType.getName(), item.getQuantity(),
                        ticketType.getStandardPrice(), null, ticketType);
            }
        };
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByUsername(auth.getName()).map(user -> user.getId()).orElse(null);
    }

    private String json(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Cannot serialize POS data", ex); }
    }
}
