package com.smartpark.domain.lpr.entity;
import com.smartpark.domain.device.entity.IoTDevice;
import com.smartpark.domain.parking.entity.ParkingLot;
import com.smartpark.domain.parking.entity.ParkingTransaction;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="lpr_scan_events", uniqueConstraints=@UniqueConstraint(name="uk_lpr_device_request", columnNames={"device_id","request_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LprScanEvent {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="device_id",nullable=false) private IoTDevice device;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="parking_lot_id",nullable=false) private ParkingLot parkingLot;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="parking_transaction_id") private ParkingTransaction parkingTransaction;
 @Column(name="request_id",nullable=false,length=64) private String requestId;
 @Column(nullable=false,length=10) private String direction;
 @Column(name="plate_number",length=20) private String plateNumber;
 @Column(precision=5,scale=4) private BigDecimal confidence;
 @Column(name="image_reference",nullable=false,length=500) private String imageReference;
 @Column(nullable=false,length=20) private String decision;
 @Column(name="barrier_command",nullable=false,length=20) private String barrierCommand;
 @Column(name="error_code",length=40) private String errorCode;
 @Column(name="captured_at",nullable=false) private LocalDateTime capturedAt;
 @Column(name="processed_at",nullable=false) private LocalDateTime processedAt;
 @Column(name="latency_ms",nullable=false) private Long latencyMs;
}
