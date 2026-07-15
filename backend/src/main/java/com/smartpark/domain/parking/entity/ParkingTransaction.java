package com.smartpark.domain.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng parking_transactions - phiên đỗ xe (ParkingSession).
 * SRS schema: (id, parking_lot_id, entry_gate_id, exit_gate_id,
 *              vehicle_plate, vehicle_type, entry_time, exit_time,
 *              parking_fee, amount_paid, payment_status, status, notes)
 * MODULE 26: BR-PARK-01: lưu ảnh chụp biển số, mở barie trong vòng 1 giây.
 * Dashboard 4.19: phục vụ FactParking trong BigQuery.
 */
@Entity
@Table(name = "parking_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParkingTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_lot_id", nullable = false)
    private ParkingLot parkingLot;

    /** Cổng vào - có thể null nếu nhập tự thủ công */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_gate_id")
    private Gate entryGate;

    /** Cổng ra - null khi xe chưa ra */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exit_gate_id")
    private Gate exitGate;

    /** Biển số xe được nhận diện qua LPR camera */
    @Column(name = "vehicle_plate", nullable = false, length = 20)
    private String vehiclePlate;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;

    @Column(name = "entry_time", nullable = false)
    private LocalDateTime entryTime;

    /** Null khi xe chưa ra khỏi bãi */
    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    /** Phí đỗ xe tính theo thời gian */
    @Column(name = "parking_fee", precision = 15, scale = 2)
    private BigDecimal parkingFee;

    /** Số tiền đã trả thực tế */
    @Column(name = "amount_paid", precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParkingStatus status = ParkingStatus.PARKED;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "entry_image_reference", length = 500)
    private String entryImageReference;

    @Column(name = "exit_image_reference", length = 500)
    private String exitImageReference;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "entry_device_id")
    private com.smartpark.domain.device.entity.IoTDevice entryDevice;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "exit_device_id")
    private com.smartpark.domain.device.entity.IoTDevice exitDevice;

    @Column(name = "entry_recognition_confidence", precision = 5, scale = 4)
    private BigDecimal entryRecognitionConfidence;

    @Column(name = "exit_recognition_confidence", precision = 5, scale = 4)
    private BigDecimal exitRecognitionConfidence;

    public enum VehicleType { MOTORBIKE, CAR, TRUCK, BUS }
    public enum ParkingStatus { PARKED, EXITED, OVERSTAY }
    public enum PaymentStatus { UNPAID, PAID, WAIVED }
}
