package com.smartpark.domain.parking.repository;

import com.smartpark.domain.parking.entity.Gate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GateRepository extends JpaRepository<Gate, Long> {

    /**
     * Kiểm tra mã cổng đã tồn tại chưa (không kể đã xóa mềm).
     */
    boolean existsByCodeAndDeletedAtIsNull(String code);

    /**
     * Lấy gate active theo code.
     */
    Optional<Gate> findByCodeAndDeletedAtIsNull(String code);

    /**
     * Lấy gate active theo id.
     */
    @Query("SELECT g FROM Gate g WHERE g.id = :id AND g.deletedAt IS NULL")
    Optional<Gate> findByIdAndNotDeleted(@Param("id") Long id);

    /**
     * Tìm tất cả gate chưa xóa, hỗ trợ filter.
     */
    @Query("SELECT g FROM Gate g WHERE g.deletedAt IS NULL " +
           "AND (:search IS NULL OR LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(g.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR g.status = :status) " +
           "AND (:type IS NULL OR g.type = :type) " +
           "AND (:parkingAreaId IS NULL OR g.parkingArea.id = :parkingAreaId) " +
           "AND (:zoneId IS NULL OR g.zone.id = :zoneId)")
    Page<Gate> findAllWithFilters(
            @Param("search") String search,
            @Param("status") Gate.GateStatus status,
            @Param("type") Gate.GateType type,
            @Param("parkingAreaId") Long parkingAreaId,
            @Param("zoneId") Long zoneId,
            Pageable pageable);
}
