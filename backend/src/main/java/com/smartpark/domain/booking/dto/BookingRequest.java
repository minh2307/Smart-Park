package com.smartpark.domain.booking.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequest {
    private Long customerId;
    private List<TicketRequest> tickets;
    private LocalDate validDate;
    private String couponCode;

    @Data
    public static class TicketRequest {
        private Long ticketTypeId;
        private int quantity;
    }
}
