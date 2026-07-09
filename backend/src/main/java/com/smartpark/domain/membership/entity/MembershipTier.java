package com.smartpark.domain.membership.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "membership_tiers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @Column(name = "points_multiplier", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pointsMultiplier = BigDecimal.ONE;

    /** Minimum cumulative spend to reach this tier */
    @Column(name = "min_spend", precision = 15, scale = 2)
    private BigDecimal minSpend;
}
