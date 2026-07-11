package com.smartpark.domain.membership.repository;

import com.smartpark.domain.membership.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByCustomerId(Long customerId);
    Optional<Membership> findByMembershipCode(String membershipCode);

    long countByStatus(com.smartpark.domain.membership.entity.Membership.MembershipStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(m) FROM Membership m WHERE m.status = com.smartpark.domain.membership.entity.Membership.MembershipStatus.ACTIVE AND m.createdAt <= :date")
    long countActiveMembershipsBefore(@org.springframework.data.repository.query.Param("date") java.time.LocalDateTime date);
}
