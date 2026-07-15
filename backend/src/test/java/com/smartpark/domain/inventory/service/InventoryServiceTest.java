package com.smartpark.domain.inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.audit.repository.AuditLogRepository;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.inventory.dto.InventoryDto;
import com.smartpark.domain.inventory.entity.InventoryTransaction;
import com.smartpark.domain.inventory.repository.InventoryTransactionRepository;
import com.smartpark.domain.retail.entity.*;
import com.smartpark.domain.retail.repository.RetailItemRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    @Mock RetailItemRepository itemRepository;
    @Mock InventoryTransactionRepository transactionRepository;
    @Mock AuditLogRepository auditLogRepository;
    @Mock UserRepository userRepository;
    InventoryService service;
    RetailItem item;

    @BeforeEach void setUp() {
        service = new InventoryService(itemRepository, transactionRepository, auditLogRepository, userRepository, new ObjectMapper());
        RetailShop shop = RetailShop.builder().id(2L).build();
        item = RetailItem.builder().id(101L).retailShop(shop).sku("TSHIRT-001").name("T-Shirt")
                .stockQuantity(10).reservedQuantity(2).lowStockThreshold(3).status(RetailItem.RetailItemStatus.ACTIVE).build();
        lenient().when(itemRepository.findBySkuForUpdate("TSHIRT-001")).thenReturn(Optional.of(item));
        lenient().when(transactionRepository.save(any())).thenAnswer(invocation -> {
            InventoryTransaction tx = invocation.getArgument(0); tx.setId(9L); return tx;
        });
    }

    @Test void decreaseRecordsDeltaAndAudit() {
        InventoryDto.AdjustmentRequest request = InventoryDto.AdjustmentRequest.builder().sku("TSHIRT-001").shopId(2L)
                .adjustmentType(InventoryTransaction.TransactionType.DECREASE).quantity(4).reason("DAMAGE").build();
        InventoryDto.ItemResponse response = service.adjust(request);
        assertEquals(6, response.getCurrentQuantity());
        assertEquals(4, response.getAvailableQuantity());
        verify(transactionRepository).save(argThat(tx -> tx.getQuantityDelta() == -4 && tx.getQuantityBefore() == 10 && tx.getQuantityAfter() == 6));
        verify(auditLogRepository).save(any());
    }

    @Test void cannotConsumeReservedStock() {
        item.setStockQuantity(3);
        item.setReservedQuantity(2);
        assertThrows(ConflictException.class, () -> service.consumeLocked(item, 2, 50L, 1L));
        verify(transactionRepository, never()).save(any());
    }
}
