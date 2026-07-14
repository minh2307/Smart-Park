package com.smartpark.domain.ticket.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketTypeRequestDto {

    @NotNull(message = "Khu vui chơi (venueId) không được để trống")
    private Long venueId;

    @NotBlank(message = "Tên loại vé không được để trống")
    @Size(max = 100, message = "Tên loại vé không được vượt quá 100 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Giá vé tiêu chuẩn không được để trống")
    @PositiveOrZero(message = "Giá vé tiêu chuẩn phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @PositiveOrZero(message = "Giá tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal minPrice;

    @PositiveOrZero(message = "Giá tối đa phải lớn hơn hoặc bằng 0")
    private BigDecimal maxPrice;

    @NotNull(message = "Tổng số lượng vé không được để trống")
    @Min(value = 0, message = "Tổng số lượng vé phải lớn hơn hoặc bằng 0")
    private Integer totalQuantity;

    private Integer availableQuantity;

    @NotBlank(message = "Phân loại vé (type) không được để trống")
    private String type; // Map to TicketCategory (ADULT, CHILD, VIP, DAILY, MONTHLY)

    @Builder.Default
    private String status = "ACTIVE"; // Map to TicketTypeStatus (ACTIVE, INACTIVE)
}
