package com.smartpark.domain.parking.repository;

import com.smartpark.domain.parking.entity.ParkingTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingTransaction, Long> {

    /**
     * Tìm phiên đỗ xe đang hoạt động theo biển số xe.
     */
    Optional<ParkingTransaction> findByVehiclePlateAndStatus(
            String vehiclePlate,
            ParkingTransaction.ParkingStatus status);

    /**
     * Lấy tất cả phiên với filter đầy đủ.
     */
    @Query("SELECT t FROM ParkingTransaction t WHERE " +
           "(:licensePlate IS NULL OR LOWER(t.vehiclePlate) LIKE LOWER(CONCAT('%', :licensePlate, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:parkingAreaId IS NULL OR t.parkingLot.id = :parkingAreaId) AND " +
           "(:entryGateId IS NULL OR t.entryGate.id = :entryGateId) AND " +
           "(:vehicleType IS NULL OR t.vehicleType = :vehicleType) AND " +
           "(:fromDate IS NULL OR t.entryTime >= :fromDate) AND " +
           "(:toDate IS NULL OR t.entryTime <= :toDate)")
    Page<ParkingTransaction> findAllWithFilters(
            @Param("licensePlate") String licensePlate,
            @Param("status") ParkingTransaction.ParkingStatus status,
            @Param("parkingAreaId") Long parkingAreaId,
            @Param("entryGateId") Long entryGateId,
            @Param("vehicleType") ParkingTransaction.VehicleType vehicleType,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

    /**
     * Lấy danh sách xe đang trong bãi (chưa ra).
     */
    @Query("SELECT t FROM ParkingTransaction t WHERE t.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.PARKED")
    Page<ParkingTransaction> findCurrentSessions(Pageable pageable);

    /**
     * Lịch sử đã kết thúc.
     */
    @Query("SELECT t FROM ParkingTransaction t WHERE t.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.EXITED ORDER BY t.exitTime DESC")
    Page<ParkingTransaction> findHistory(Pageable pageable);

    /**
     * Đếm xe đang trong một bãi.
     */
    long countByParkingLotIdAndStatus(Long lotId, ParkingTransaction.ParkingStatus status);

    /**
     * Tổng doanh thu theo khoảng thời gian.
     */
    @Query("SELECT COALESCE(SUM(t.amountPaid), 0) FROM ParkingTransaction t " +
           "WHERE t.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.EXITED " +
           "AND t.exitTime BETWEEN :from AND :to")
    BigDecimal sumAmountPaidByExitTimeBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    /**
     * Doanh thu theo ngày (native query cho BigQuery BI).
     */
    @Query(value = "SELECT DATE(exit_time) as dateVal, SUM(amount_paid) " +
                   "FROM parking_transactions " +
                   "WHERE status = 'EXITED' AND exit_time BETWEEN :from AND :to " +
                   "GROUP BY DATE(exit_time) ORDER BY dateVal ASC",
           nativeQuery = true)
    List<Object[]> sumDailyParkingRevenueBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    /**
     * Đếm xe đang trong bãi (không có exit_time).
     */
    long countByExitTimeIsNull();
}
