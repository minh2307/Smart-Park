package com.smartpark.domain.customer.repository;

import com.smartpark.domain.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByUserId(Long userId);
    boolean existsByPhone(String phone);
    java.util.List<Customer> findByFullName(String fullName);
}
