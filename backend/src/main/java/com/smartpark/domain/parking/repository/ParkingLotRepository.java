package com.smartpark.domain.parking.repository;

import com.smartpark.domain.parking.entity.ParkingLot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParkingLotRepository extends JpaRepository<ParkingLot, Long> {

    /**
     * Tìm tất cả bãi đỗ xe chưa bị xóa mềm, hỗ trợ filter.
     */
    @Query("SELECT p FROM ParkingLot p WHERE p.deletedAt IS NULL " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:vehicleType IS NULL OR p.vehicleType = :vehicleType)")
    Page<ParkingLot> findAllActive(
            @Param("search") String search,
            @Param("status") ParkingLot.ParkingLotStatus status,
            @Param("vehicleType") ParkingLot.VehicleType vehicleType,
            Pageable pageable);

    /**
     * Lấy 1 bãi chưa bị xóa.
     */
    @Query("SELECT p FROM ParkingLot p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<ParkingLot> findByIdAndNotDeleted(@Param("id") Long id);

    /**
     * Kiểm tra còn active session chưa (để chặn xóa bãi).
     */
    @Query("SELECT COUNT(t) FROM ParkingTransaction t WHERE t.parkingLot.id = :lotId AND t.status = com.smartpark.domain.parking.entity.ParkingTransaction.ParkingStatus.PARKED")
    long countActiveSessionsByLotId(@Param("lotId") Long lotId);

    /**
     * Đếm tổng số bãi theo status.
     */
    long countByStatusAndDeletedAtIsNull(ParkingLot.ParkingLotStatus status);

    /**
     * Đếm tất cả bãi chưa xóa.
     */
    long countByDeletedAtIsNull();
}
