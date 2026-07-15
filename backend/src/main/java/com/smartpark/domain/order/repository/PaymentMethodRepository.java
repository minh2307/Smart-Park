package com.smartpark.domain.order.repository;

import com.smartpark.domain.order.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    Optional<PaymentMethod> findByCode(String code);

    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_READ)
    @Query("select p from PaymentMethod p where upper(p.code) = upper(:code)")
    Optional<PaymentMethod> findActiveCandidateForCheckout(String code);
}
