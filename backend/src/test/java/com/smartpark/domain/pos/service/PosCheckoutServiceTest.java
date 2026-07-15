package com.smartpark.domain.pos.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.settings.service.FeatureFlagService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosCheckoutServiceTest {
    @Mock PosIdempotencyService idempotencyService;
    @Mock PosCheckoutTransactionService transactionService;
    @Mock FeatureFlagService featureFlagService;

    private PosCheckoutDto.CheckoutRequest request() {
        return PosCheckoutDto.CheckoutRequest.builder().terminalId("POS-01").parkId(1L).customerId(15L)
                .paymentMethodCode("CASH").items(List.of(PosCheckoutDto.ItemRequest.builder()
                        .itemType(PosCheckoutDto.ItemType.RETAIL).referenceId(101L).sku("TSHIRT-001").quantity(2).build())).build();
    }

    @Test void returnsCachedResponseWithoutRepeatingTransaction() {
        PosCheckoutService service = new PosCheckoutService(idempotencyService, transactionService, new ObjectMapper(), featureFlagService);
        PosCheckoutDto.CheckoutResponse cached = PosCheckoutDto.CheckoutResponse.builder().orderId(10L).build();
        when(idempotencyService.claim(eq("key-1"), anyString()))
                .thenReturn(new PosIdempotencyService.Claim(5L, Optional.of(cached)));
        assertSame(cached, service.checkout("key-1", request()));
        verifyNoInteractions(transactionService);
    }

    @Test void marksClaimFailedWhenCheckoutRollsBack() {
        PosCheckoutService service = new PosCheckoutService(idempotencyService, transactionService, new ObjectMapper(), featureFlagService);
        when(idempotencyService.claim(eq("key-2"), anyString()))
                .thenReturn(new PosIdempotencyService.Claim(6L, Optional.empty()));
        when(transactionService.execute(eq(6L), any(PosCheckoutDto.CheckoutRequest.class))).thenThrow(new BusinessException("failed"));
        assertThrows(BusinessException.class, () -> service.checkout("key-2", request()));
        verify(idempotencyService).markFailed(6L);
    }

    @Test void requiresIdempotencyKey() {
        PosCheckoutService service = new PosCheckoutService(idempotencyService, transactionService, new ObjectMapper(), featureFlagService);
        assertThrows(BusinessException.class, () -> service.checkout(" ", request()));
    }
}
