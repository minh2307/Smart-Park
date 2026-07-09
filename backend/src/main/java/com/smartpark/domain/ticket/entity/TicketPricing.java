package com.smartpark.domain.ticket.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_pricings")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;

    /** SRS schema: column name is 'date' (ticket_pricings.date) */
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "dynamic_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal dynamicPrice;

    @Column(name = "override_reason", length = 200)
    private String overrideReason;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
