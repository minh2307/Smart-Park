package com.gateos.module.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Venue ID không được để trống")
    private Long venueId;

    @NotEmpty(message = "Danh sách vé không được để trống")
    @Valid
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {

        @NotNull(message = "Ticket Type ID không được để trống")
        private Long ticketTypeId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải >= 1")
        @Max(value = 10, message = "Số lượng tối đa là 10 vé mỗi loại")
        private Integer quantity;
    }
}
