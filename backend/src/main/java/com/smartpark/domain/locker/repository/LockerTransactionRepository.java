package com.smartpark.domain.locker.repository;

import com.smartpark.domain.locker.entity.LockerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockerTransactionRepository extends JpaRepository<LockerTransaction, Long> {
    Optional<LockerTransaction> findByLockerIdAndStatus(Long lockerId, LockerTransaction.LockerTransactionStatus status);
    List<LockerTransaction> findByCustomerId(Long customerId);
    long countByStatus(LockerTransaction.LockerTransactionStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(lt.amountPaid), 0) FROM LockerTransaction lt WHERE lt.status = com.smartpark.domain.locker.entity.LockerTransaction.LockerTransactionStatus.COMPLETED AND lt.endTime BETWEEN :from AND :to")
    java.math.BigDecimal sumAmountPaidByEndTimeBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE(end_time) as dateVal, SUM(amount_paid) FROM locker_transactions WHERE status = 'COMPLETED' AND end_time BETWEEN :from AND :to GROUP BY DATE(end_time) ORDER BY dateVal ASC", nativeQuery = true)
    List<Object[]> sumDailyLockerRevenueBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}
