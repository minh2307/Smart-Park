package com.smartpark.domain.parking.repository;

import com.smartpark.domain.parking.entity.ParkingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingTransactionRepository extends JpaRepository<ParkingTransaction, Long> {
    Optional<ParkingTransaction> findByVehiclePlateAndStatus(String plate, ParkingTransaction.ParkingStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ParkingTransaction p WHERE p.parkingLot.id = :lotId AND p.vehiclePlate = :plate AND p.status = :status")
    Optional<ParkingTransaction> findActiveForUpdate(@Param("lotId") Long lotId, @Param("plate") String plate, @Param("status") ParkingTransaction.ParkingStatus status);
    List<ParkingTransaction> findByParkingLotId(Long lotId);
    long countByExitTimeIsNull();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pt.amountPaid), 0) FROM ParkingTransaction pt WHERE pt.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.EXITED AND pt.exitTime BETWEEN :from AND :to")
    java.math.BigDecimal sumAmountPaidByExitTimeBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(exit_time) as dateVal, SUM(amount_paid) FROM parking_transactions WHERE status = 'EXITED' AND exit_time BETWEEN :from AND :to GROUP BY DATE(exit_time) ORDER BY dateVal ASC", nativeQuery = true)
    List<Object[]> sumDailyParkingRevenueBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT pl.id as lotId, pl.name as lotName, COALESCE(SUM(pt.amount_paid), 0) as totalParkingFee, COUNT(pt.id) as totalSessions FROM parking_transactions pt JOIN parking_lots pl ON pt.parking_lot_id = pl.id WHERE pt.entry_time BETWEEN :from AND :to GROUP BY pl.id, pl.name", nativeQuery = true)
    List<com.smartpark.domain.bi.projection.ParkingOccupancyProjection> getParkingOccupancyAndRevenueReport(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

