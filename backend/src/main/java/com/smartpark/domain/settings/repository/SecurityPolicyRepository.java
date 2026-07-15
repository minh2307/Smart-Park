package com.smartpark.domain.settings.repository;

import com.smartpark.domain.settings.entity.SecurityPolicy;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SecurityPolicyRepository extends JpaRepository<SecurityPolicy, Byte> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from SecurityPolicy p where p.id = 1")
    Optional<SecurityPolicy> findForUpdate();
}
