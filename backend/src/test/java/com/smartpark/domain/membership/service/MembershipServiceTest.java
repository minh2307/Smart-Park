package com.smartpark.domain.membership.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.repository.PointHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock private MembershipRepository membershipRepository;
    @Mock private MembershipTierRepository membershipTierRepository;
    @Mock private PointHistoryRepository pointHistoryRepository;
    @Mock private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private MembershipService membershipService;

    private Membership membership;
    private MembershipTier tier;

    @BeforeEach
    void setUp() {
        tier = new MembershipTier();
        tier.setId(1L);
        tier.setName("Gold");
        tier.setMinSpend(BigDecimal.valueOf(500000));
        tier.setPointsMultiplier(BigDecimal.valueOf(1.5));

        membership = new Membership();
        membership.setId(1L);
        membership.setPoints(100L);
        membership.setStatus(Membership.MembershipStatus.ACTIVE);
        membership.setTier(tier);
    }

    @Test
    void findAll_ShouldReturnPage() {
        when(membershipRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(membership)));
        Page<Membership> result = membershipService.findAll(PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void findById_ShouldReturnMembership() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        Membership result = membershipService.findById(1L);
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void findById_ShouldThrow_WhenNotFound() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> membershipService.findById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateTier_ShouldUpdate() {
        MembershipTier newTier = new MembershipTier();
        newTier.setId(2L);
        newTier.setName("Platinum");
        
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        when(membershipTierRepository.findById(2L)).thenReturn(Optional.of(newTier));
        when(membershipRepository.save(any())).thenReturn(membership);

        Membership result = membershipService.updateTier(1L, 2L);
        assertThat(result.getTier().getName()).isEqualTo("Platinum");
    }

    @Test
    void addPointsAndCheckTier_ShouldAddPointsAndUpgradeTier() {
        when(membershipRepository.findByCustomerId(100L)).thenReturn(Optional.of(membership));
        
        MembershipTier platinum = new MembershipTier();
        platinum.setId(2L);
        platinum.setName("Platinum");
        platinum.setMinSpend(BigDecimal.valueOf(1000000)); // 1M
        
        when(membershipTierRepository.findAll()).thenReturn(List.of(tier, platinum));
        when(membershipRepository.save(any())).thenReturn(membership);

        // Spend 1,000,000 / 10000 = 100 base points.
        // Multiply by 1.5 (Gold) = 150 points.
        // Current points = 100 + 150 = 250 points.
        // 250 points = 2,500,000 equivalent spend -> Upgrade to Platinum.
        Membership result = membershipService.addPointsAndCheckTier(100L, 10L, BigDecimal.valueOf(1000000));
        
        assertThat(result.getPoints()).isEqualTo(250L);
        assertThat(result.getTier().getName()).isEqualTo("Platinum");
        verify(pointHistoryRepository).save(any(PointHistory.class));
        verify(analyticsEventPublisher).publish(any(), any(), any(), any(), any(), any());
    }

    @Test
    void getHistory_ShouldReturnHistory() {
        when(pointHistoryRepository.findByMembershipId(1L)).thenReturn(List.of(new PointHistory()));
        List<PointHistory> result = membershipService.getHistory(1L);
        assertThat(result).hasSize(1);
    }
}
