package com.smartpark.domain.membership.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.repository.PointHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    @Transactional(readOnly = true)
    public Page<Membership> findAll(Pageable pageable) {
        return membershipRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Membership findById(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", id));
    }

    @Transactional
    public Membership updateTier(Long id, Long tierId) {
        Membership membership = findById(id);
        MembershipTier tier = membershipTierRepository.findById(tierId)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipTier", tierId));
        membership.setTier(tier);
        return membershipRepository.save(membership);
    }

    /**
     * Tích điểm & Thăng hạng tự động.
     * Quy tắc: 10,000 VND = 1 điểm. Điểm thực nhận = Điểm cơ bản * Hệ số nhân của hạng thẻ.
     */
    @Transactional
    public Membership addPointsAndCheckTier(Long customerId, Long orderId, BigDecimal spentAmount) {
        Membership membership = membershipRepository.findByCustomerId(customerId).orElse(null);

        if (membership == null || membership.getStatus() != Membership.MembershipStatus.ACTIVE) {
            log.info("[MEMBERSHIP] Customer {} không có thẻ thành viên active để tích điểm.", customerId);
            return membership;
        }

        // Tính điểm: (Spent Amount / 10000) * pointsMultiplier
        long basePoints = spentAmount.divide(BigDecimal.valueOf(10000)).longValue();
        long pointsEarned = basePoints;
        
        if (membership.getTier() != null && membership.getTier().getPointsMultiplier() != null) {
            pointsEarned = (long) (basePoints * membership.getTier().getPointsMultiplier().doubleValue());
        }

        if (pointsEarned > 0) {
            membership.setPoints(membership.getPoints() + pointsEarned);

            // Ghi lịch sử điểm
            PointHistory history = PointHistory.builder()
                    .membership(membership)
                    .orderId(orderId)
                    .pointsEarned(pointsEarned)
                    .reason("Tích điểm từ thanh toán đơn hàng " + orderId)
                    .build();
            pointHistoryRepository.save(history);

            log.info("[MEMBERSHIP POINTS] Customer {} nhận {} điểm từ orderId {}.", customerId, pointsEarned, orderId);
        }

        // Logic thăng hạng (Tier upgrade) - dựa trên tổng chi tiêu tích lũy (Có thể ước tính qua số điểm)
        BigDecimal currentSpendEq = BigDecimal.valueOf(membership.getPoints()).multiply(BigDecimal.valueOf(10000));
        List<MembershipTier> allTiers = membershipTierRepository.findAll();
        
        MembershipTier newTier = membership.getTier();
        for (MembershipTier tier : allTiers) {
            if (tier.getMinSpend() != null && currentSpendEq.compareTo(tier.getMinSpend()) >= 0) {
                if (newTier == null || tier.getMinSpend().compareTo(newTier.getMinSpend()) > 0) {
                    newTier = tier;
                }
            }
        }

        if (newTier != null && (membership.getTier() == null || !newTier.getId().equals(membership.getTier().getId()))) {
            String oldTierName = membership.getTier() != null ? membership.getTier().getName() : "None";
            log.info("[MEMBERSHIP UPGRADE] Customer {} thăng hạng lên {}", customerId, newTier.getName());
            membership.setTier(newTier);

            // Trigger MEMBERSHIP_UPGRADED
            analyticsEventPublisher.publish(
                    AnalyticsEvent.EventType.MEMBERSHIP_UPGRADED,
                    customerId,
                    "Membership",
                    membership.getId(),
                    null,
                    java.util.Map.of(
                            "oldTier", oldTierName,
                            "newTier", newTier.getName()
                    )
            );
        }

        return membershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public List<PointHistory> getHistory(Long membershipId) {
        return pointHistoryRepository.findByMembershipId(membershipId);
    }
}
