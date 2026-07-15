package com.smartpark.domain.inventory.dto;

import com.smartpark.domain.inventory.entity.InventoryTransaction;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

public final class InventoryDto {
    private InventoryDto() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AdjustmentRequest {
        @NotBlank @Size(max = 50)
        private String sku;
        @NotNull @Positive
        private Long shopId;
        @NotNull
        private InventoryTransaction.TransactionType adjustmentType;
        @NotNull @PositiveOrZero
        private Integer quantity;
        @NotBlank @Size(max = 80)
        private String reason;
        @Size(max = 500)
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long itemId;
        private String sku;
        private String itemName;
        private Long shopId;
        private Integer currentQuantity;
        private Integer reservedQuantity;
        private Integer availableQuantity;
        private Integer lowStockThreshold;
        private String status;
        private LocalDateTime updatedAt;
    }
}
