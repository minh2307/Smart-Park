package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    List<VoucherUsage> findByVoucherId(Long voucherId);
    List<VoucherUsage> findByCustomerId(Long customerId);
}
