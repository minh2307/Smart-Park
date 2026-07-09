package com.smartpark.domain.parking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Bảng parking_transactions - giao dịch ra/vào bãi đỗ xe.
 * SRS schema: (id, parking_lot_id, vehicle_plate, vehicle_type, entry_time, exit_time, amount_paid, status)
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

    @Column(name = "amount_paid", precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParkingStatus status = ParkingStatus.PARKED;

    public enum VehicleType { MOTORBIKE, CAR, TRUCK, BUS }
    public enum ParkingStatus { PARKED, EXITED, OVERSTAY }
}
