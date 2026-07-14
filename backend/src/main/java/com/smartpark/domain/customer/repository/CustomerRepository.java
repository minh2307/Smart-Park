package com.smartpark.domain.customer.repository;

import com.smartpark.domain.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhone(String phone);
    Optional<Customer> findByUserId(Long userId);
    boolean existsByPhone(String phone);
    java.util.List<Customer> findByFullName(String fullName);

    long countByCreatedAtBetween(java.time.LocalDateTime from, java.time.LocalDateTime to);

    @Query(value = "SELECT DATE(created_at) as period, COUNT(id) as newCustomersCount FROM customers WHERE created_at BETWEEN :from AND :to GROUP BY DATE(created_at) ORDER BY period ASC", nativeQuery = true)
    java.util.List<com.smartpark.domain.bi.projection.CustomerRegistrationProjection> getNewCustomersTrendDaily(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y-%m') as period, COUNT(id) as newCustomersCount FROM customers WHERE created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY period ASC", nativeQuery = true)
    java.util.List<com.smartpark.domain.bi.projection.CustomerRegistrationProjection> getNewCustomersTrendMonthly(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT DATE_FORMAT(created_at, '%Y') as period, COUNT(id) as newCustomersCount FROM customers WHERE created_at BETWEEN :from AND :to GROUP BY DATE_FORMAT(created_at, '%Y') ORDER BY period ASC", nativeQuery = true)
    java.util.List<com.smartpark.domain.bi.projection.CustomerRegistrationProjection> getNewCustomersTrendYearly(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query(value = "SELECT COUNT(DISTINCT customer_id) FROM (SELECT customer_id FROM orders WHERE status = 'PAID' AND created_at BETWEEN :from AND :to GROUP BY customer_id HAVING COUNT(DISTINCT DATE(created_at)) >= 2) t", nativeQuery = true)
    long countReturningCustomers(@org.springframework.data.repository.query.Param("from") java.time.LocalDateTime from, @org.springframework.data.repository.query.Param("to") java.time.LocalDateTime to);

    @Query("SELECT mt.name, COUNT(m) FROM Membership m JOIN m.tier mt WHERE m.status = com.smartpark.domain.membership.entity.Membership.MembershipStatus.ACTIVE GROUP BY mt.name")
    java.util.List<Object[]> countCustomersByMembershipTier();
}

