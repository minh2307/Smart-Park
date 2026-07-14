package com.smartpark.domain.ride.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ride_categories")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RideCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private String code;

    @Transient
    @Builder.Default
    private String status = "ACTIVE";

    @Transient
    @Builder.Default
    private Integer rideCount = 0;

    public String getCode() {
        if (code == null && name != null) {
            return "CAT-" + name.toUpperCase().replaceAll("[^A-Z0-9]", "");
        }
        return code;
    }
}
