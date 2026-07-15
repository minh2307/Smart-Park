package com.smartpark.domain.lpr.controller;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.lpr.dto.*;
import com.smartpark.domain.lpr.service.LprService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/lpr") @RequiredArgsConstructor @Tag(name="LPR Camera")
public class LprController {private final LprService service;@PostMapping(value="/scan",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)@PreAuthorize("hasAuthority('PARKING_MANAGE') or hasAuthority('DEVICE_LPR')")@Operation(summary="Recognize a plate and process an idempotent parking entry or exit")public ApiResponse<LprScanResponse> scan(@Valid @ModelAttribute LprScanRequest request){return ApiResponse.success(service.process(request));}}
