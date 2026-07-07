package com.gateos.module.tickettype.dto;

import com.gateos.module.tickettype.entity.TicketType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TicketTypeRequest {

    @NotNull(message = "Venue ID không được để trống")
    private Long venueId;

    @NotBlank(message = "Tên loại vé không được để trống")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Phân loại vé không được để trống")
    private TicketType.TicketCategory type;

    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "0.0", message = "Giá vé phải >= 0")
    private BigDecimal price;

    private TicketType.TicketTypeStatus status = TicketType.TicketTypeStatus.ACTIVE;

    private String policy;

    @Min(value = 1, message = "Số ngày hiệu lực phải >= 1")
    private Integer validDays = 1;
}
