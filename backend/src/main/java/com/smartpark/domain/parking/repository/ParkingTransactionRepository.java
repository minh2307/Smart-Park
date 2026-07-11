package com.smartpark.domain.parking.repository;

import com.smartpark.domain.parking.entity.ParkingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingTransactionRepository extends JpaRepository<ParkingTransaction, Long> {
    Optional<ParkingTransaction> findByVehiclePlateAndStatus(String plate, ParkingTransaction.ParkingStatus status);
    List<ParkingTransaction> findByParkingLotId(Long lotId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pt.amountPaid), 0) FROM ParkingTransaction pt WHERE pt.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.EXITED AND pt.exitTime BETWEEN :from AND :to")
    java.math.BigDecimal sumAmountPaidByExitTimeBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(exit_time) as dateVal, SUM(amount_paid) FROM parking_transactions WHERE status = 'EXITED' AND exit_time BETWEEN :from AND :to GROUP BY DATE(exit_time) ORDER BY dateVal ASC", nativeQuery = true)
    List<Object[]> sumDailyParkingRevenueBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
