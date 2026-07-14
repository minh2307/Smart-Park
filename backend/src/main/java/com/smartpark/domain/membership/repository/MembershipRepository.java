package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByCustomerId(Long customerId);
    Optional<Membership> findByMembershipCode(String membershipCode);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Membership m WHERE " +
           "(:search IS NULL OR LOWER(m.membershipCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:tierId IS NULL OR m.tier.id = :tierId) AND " +
           "(:expiryFrom IS NULL OR m.expirationDate >= :expiryFrom) AND " +
           "(:expiryTo IS NULL OR m.expirationDate <= :expiryTo)")
    org.springframework.data.domain.Page<Membership> findAllWithFilters(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("status") Membership.MembershipStatus status,
            @org.springframework.data.repository.query.Param("tierId") Long tierId,
            @org.springframework.data.repository.query.Param("expiryFrom") java.time.LocalDate expiryFrom,
            @org.springframework.data.repository.query.Param("expiryTo") java.time.LocalDate expiryTo,
            org.springframework.data.domain.Pageable pageable);

    Optional<Membership> findByCustomerIdAndStatus(Long customerId, Membership.MembershipStatus status);

    long countByStatus(com.smartpark.domain.membership.entity.Membership.MembershipStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = com.smartpark.domain.membership.entity.Membership.MembershipStatus.ACTIVE AND m.createdAt <= :date")
    long countActiveMembershipsBefore(@org.springframework.data.repository.query.Param("date") java.time.LocalDateTime date);
}
