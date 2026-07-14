package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.LoyaltyAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Long> {

    Optional<LoyaltyAccount> findByCustomerId(Long customerId);

    Optional<LoyaltyAccount> findByMembershipId(Long membershipId);

    @Query("SELECT la FROM LoyaltyAccount la " +
           "WHERE (:search IS NULL " +
           "  OR LOWER(la.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LoyaltyAccount> findAllWithSearch(
            @Param("search") String search,
            Pageable pageable);
}
