package com.smartpark.domain.inventory.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.repository.AuditLogRepository;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.inventory.dto.InventoryDto;
import com.smartpark.domain.inventory.entity.InventoryTransaction;
import com.smartpark.domain.inventory.repository.InventoryTransactionRepository;
import com.smartpark.domain.retail.entity.RetailItem;
import com.smartpark.domain.retail.repository.RetailItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private static final Set<String> SORT_FIELDS = Set.of("sku", "name", "stockQuantity", "updatedAt", "status");
    private final RetailItemRepository retailItemRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<InventoryDto.ItemResponse> findAll(String sku, Long shopId, String status,
                                                    Boolean lowStock, Pageable pageable) {
        validateSort(pageable.getSort());
        Specification<RetailItem> spec = Specification.where(null);
        if (sku != null && !sku.isBlank()) {
            String normalized = sku.trim().toLowerCase();
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("sku")), "%" + normalized + "%"));
        }
        if (shopId != null) spec = spec.and((root, query, cb) -> cb.equal(root.get("retailShop").get("id"), shopId));
        if (status != null && !status.isBlank()) {
            RetailItem.RetailItemStatus parsed;
            try { parsed = RetailItem.RetailItemStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ex) { throw new BusinessException("ERR-INVENTORY-003", "Invalid inventory status."); }
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), parsed));
        }
        if (Boolean.TRUE.equals(lowStock)) {
            spec = spec.and((root, query, cb) -> cb.le(
                    cb.diff(root.<Integer>get("stockQuantity"), root.<Integer>get("reservedQuantity")), root.<Integer>get("lowStockThreshold")));
        }
        return retailItemRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public InventoryDto.ItemResponse findBySku(String sku) {
        return toResponse(retailItemRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item", sku)));
    }

    @Transactional
    public InventoryDto.ItemResponse adjust(InventoryDto.AdjustmentRequest request) {
        RetailItem item = lockBySku(request.getSku());
        if (!item.getRetailShop().getId().equals(request.getShopId())) {
            throw new BusinessException("ERR-INVENTORY-001", "SKU does not belong to the requested shop.");
        }
        apply(item, request.getAdjustmentType(), request.getQuantity(), request.getReason(), request.getNote(),
                null, null, currentUserId());
        return toResponse(item);
    }

    public RetailItem setStockFromLegacyApi(Long itemId, int quantity) {
        RetailItem item = retailItemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item", itemId));
        apply(item, InventoryTransaction.TransactionType.SET, quantity, "LEGACY_STOCK_UPDATE",
                "Updated through backward-compatible retail stock endpoint", null, null, currentUserId());
        return item;
    }

    public RetailItem lockBySku(String sku) {
        return retailItemRepository.findBySkuForUpdate(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item", sku));
    }

    public void consumeLocked(RetailItem item, int quantity, Long orderId, Long actorId) {
        apply(item, InventoryTransaction.TransactionType.DECREASE, quantity, "POS_CHECKOUT", null,
                "ORDER", orderId, actorId);
    }

    private void apply(RetailItem item, InventoryTransaction.TransactionType type, int quantity, String reason,
                       String note, String referenceType, Long referenceId, Long actorId) {
        if (quantity < 0 || (type != InventoryTransaction.TransactionType.SET && quantity == 0)) {
            throw new BusinessException("ERR-INVENTORY-003", "Quantity must be positive; SET may use zero.");
        }
        int before = item.getStockQuantity();
        int reservedBefore = item.getReservedQuantity();
        int after = before;
        int reservedAfter = reservedBefore;
        switch (type) {
            case INCREASE -> after = Math.addExact(before, quantity);
            case DECREASE -> after = before - quantity;
            case SET -> after = quantity;
            case RESERVE -> reservedAfter = Math.addExact(reservedBefore, quantity);
            case RELEASE -> reservedAfter = reservedBefore - quantity;
        }
        if (after < 0 || reservedAfter < 0 || after - reservedAfter < 0) {
            throw new ConflictException("ERR-INVENTORY-002", "Insufficient available inventory.");
        }
        item.setStockQuantity(after);
        item.setReservedQuantity(reservedAfter);
        if (item.getStatus() != RetailItem.RetailItemStatus.DISCONTINUED) {
            item.setStatus(after - reservedAfter == 0 ? RetailItem.RetailItemStatus.OUT_OF_STOCK : RetailItem.RetailItemStatus.ACTIVE);
        }
        retailItemRepository.save(item);

        int delta = switch (type) {
            case INCREASE -> quantity;
            case DECREASE -> -quantity;
            case SET -> after - before;
            case RESERVE -> -quantity;
            case RELEASE -> quantity;
        };
        InventoryTransaction tx = transactionRepository.save(InventoryTransaction.builder()
                .retailItem(item).shopId(item.getRetailShop().getId()).transactionType(type)
                .quantityDelta(delta).quantityBefore(before).quantityAfter(after)
                .reservedQuantityBefore(reservedBefore).reservedQuantityAfter(reservedAfter)
                .referenceType(referenceType).referenceId(referenceId).reason(reason).note(note).createdBy(actorId).build());
        auditLogRepository.save(AuditLog.builder().userId(actorId).action("UPDATE")
                .targetTable("retail_items").recordId(item.getId())
                .oldValues(json(Map.of("stockQuantity", before, "reservedQuantity", reservedBefore)))
                .newValues(json(Map.of("stockQuantity", after, "reservedQuantity", reservedAfter,
                        "inventoryTransactionId", tx.getId()))).build());
    }

    private void validateSort(Sort sort) {
        sort.forEach(order -> {
            if (!SORT_FIELDS.contains(order.getProperty())) {
                throw new BusinessException("ERR-INVENTORY-003", "Unsupported sort field: " + order.getProperty());
            }
        });
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        return userRepository.findByUsername(auth.getName()).map(user -> user.getId()).orElse(null);
    }

    private String json(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (JsonProcessingException ex) { throw new IllegalStateException("Cannot serialize inventory audit", ex); }
    }

    private InventoryDto.ItemResponse toResponse(RetailItem item) {
        int reserved = item.getReservedQuantity() == null ? 0 : item.getReservedQuantity();
        return InventoryDto.ItemResponse.builder().itemId(item.getId()).sku(item.getSku()).itemName(item.getName())
                .shopId(item.getRetailShop().getId()).currentQuantity(item.getStockQuantity())
                .reservedQuantity(reserved).availableQuantity(item.getStockQuantity() - reserved)
                .lowStockThreshold(item.getLowStockThreshold()).status(item.getStatus().name())
                .updatedAt(item.getUpdatedAt() != null ? item.getUpdatedAt() : LocalDateTime.now()).build();
    }
}
