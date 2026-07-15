package com.smartpark.domain.pos.repository;

import com.smartpark.domain.pos.entity.PosIdempotencyRequest;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PosIdempotencyRequestRepository extends JpaRepository<PosIdempotencyRequest, Long> {
    @Modifying
    @Query(value = "INSERT IGNORE INTO pos_idempotency_requests(scope,idempotency_key,request_hash,status,expires_at,created_at,updated_at) VALUES (:scope,:key,:hash,'PROCESSING',:expiresAt,:now,:now)", nativeQuery = true)
    int insertClaim(@Param("scope") String scope, @Param("key") String key, @Param("hash") String hash,
                    @Param("expiresAt") LocalDateTime expiresAt, @Param("now") LocalDateTime now);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from PosIdempotencyRequest r where r.scope = :scope and r.idempotencyKey = :key")
    Optional<PosIdempotencyRequest> findForUpdate(String scope, String key);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from PosIdempotencyRequest r where r.id = :id")
    Optional<PosIdempotencyRequest> findByIdForUpdate(Long id);
}
