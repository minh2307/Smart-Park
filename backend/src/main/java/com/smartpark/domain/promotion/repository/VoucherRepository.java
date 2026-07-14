package com.smartpark.domain.promotion.repository;

import com.smartpark.domain.promotion.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT v FROM Voucher v WHERE " +
           "(:search IS NULL OR LOWER(v.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:customerId IS NULL OR v.customer.id = :customerId) AND " +
           "(:status IS NULL OR v.status = :status)")
    Page<Voucher> findAllWithFilters(String search, Long customerId, Voucher.VoucherStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(v.voucherValue), 0) FROM Voucher v WHERE v.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumVoucherValueIssued(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query("SELECT COALESCE(SUM(v.remainingBalance), 0) FROM Voucher v WHERE v.createdAt BETWEEN :from AND :to")
    java.math.BigDecimal sumRemainingBalanceBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);
}

