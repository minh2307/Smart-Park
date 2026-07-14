package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    List<VoucherUsage> findByVoucherId(Long voucherId);
    List<VoucherUsage> findByCustomerId(Long customerId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(vu.amountUsed), 0) FROM VoucherUsage vu WHERE vu.usedAt BETWEEN :from AND :to")
    java.math.BigDecimal sumAmountUsedBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

