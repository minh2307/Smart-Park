package com.smartpark.domain.pos.entity;

import com.smartpark.domain.park.entity.Park;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "pos_terminals")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosTerminal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "terminal_code", nullable = false, unique = true, length = 50)
    private String terminalCode;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "park_id", nullable = false)
    private Park park;
    @Column(length = 200)
    private String location;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    @Builder.Default
    private TerminalStatus status = TerminalStatus.ACTIVE;
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
    @CreatedDate @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @LastModifiedDate @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    public enum TerminalStatus { ACTIVE, INACTIVE, MAINTENANCE }
}
