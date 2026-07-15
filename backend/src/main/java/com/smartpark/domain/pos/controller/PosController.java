package com.smartpark.domain.pos.controller;

import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.pos.dto.PosCheckoutDto;
import com.smartpark.domain.pos.service.PosCheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/pos")
@RequiredArgsConstructor
public class PosController {
    private final PosCheckoutService checkoutService;

    @PostMapping("/checkout")
    @PreAuthorize("hasAuthority('POS_CREATE')")
    @Operation(summary = "Atomically checkout a mixed POS cart")
    public ResponseEntity<ApiResponse<PosCheckoutDto.CheckoutResponse>> checkout(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody PosCheckoutDto.CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(checkoutService.checkout(idempotencyKey, request)));
    }
}
