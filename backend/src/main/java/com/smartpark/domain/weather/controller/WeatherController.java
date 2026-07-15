package com.smartpark.domain.weather.controller;
import com.smartpark.common.response.ApiResponse;
import com.smartpark.domain.weather.dto.WeatherForecastResponse;
import com.smartpark.domain.weather.service.WeatherService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
@RestController @RequestMapping("/api/v1/weather") @RequiredArgsConstructor @Validated @Tag(name="Weather")
public class WeatherController {private final WeatherService service;@GetMapping @PreAuthorize("hasAuthority('WEATHER_VIEW')")@Operation(summary="Get normalized weather forecasts with stale-cache fallback")public ApiResponse<WeatherForecastResponse> get(@RequestParam @Positive Long parkId,@RequestParam(required=false)@DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date,@RequestParam(defaultValue="7")@Min(1)@Max(14)int days){return ApiResponse.success(service.get(parkId,date,days));}}
