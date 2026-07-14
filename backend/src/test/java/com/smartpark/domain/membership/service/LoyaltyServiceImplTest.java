package com.smartpark.domain.membership.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.dto.LoyaltyDto;
import com.smartpark.domain.membership.entity.LoyaltyAccount;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.repository.LoyaltyAccountRepository;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.membership.repository.PointHistoryRepository;
import com.smartpark.domain.membership.service.impl.LoyaltyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyServiceImplTest {

    @Mock private LoyaltyAccountRepository accountRepository;
    @Mock private MembershipRepository membershipRepository;
    @Mock private PointHistoryRepository pointHistoryRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks
    private LoyaltyServiceImpl loyaltyService;

    private Customer customer;
    private MembershipTier goldTier;
    private Membership membership;
    private LoyaltyAccount loyaltyAccount;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .fullName("Jane Doe")
                .build();

        goldTier = MembershipTier.builder()
                .id(1L)
                .code("GOLD")
                .name("Gold Tier")
                .pointsMultiplier(BigDecimal.valueOf(1.5))
                .build();

        membership = Membership.builder()
                .id(1L)
                .membershipCode("MEM-GOLD-123")
                .customer(customer)
                .tier(goldTier)
                .points(100L)
                .status(Membership.MembershipStatus.ACTIVE)
                .currentSpending(BigDecimal.ZERO)
                .lifetimeSpending(BigDecimal.ZERO)
                .build();

        loyaltyAccount = LoyaltyAccount.builder()
                .id(1L)
                .customer(customer)
                .membership(membership)
                .currentPoints(100L)
                .totalEarned(100L)
                .totalRedeemed(0L)
                .totalExpired(0L)
                .totalAdjusted(0L)
                .build();
    }

    @Test
    void getAllAccounts_ShouldReturnPage() {
        PageImpl<LoyaltyAccount> page = new PageImpl<>(List.of(loyaltyAccount));
        when(accountRepository.findAllWithSearch(any(), any())).thenReturn(page);

        Page<LoyaltyDto.AccountResponse> result = loyaltyService.getAllAccounts("Jane", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCurrentPoints()).isEqualTo(100L);
    }

    @Test
    void earnPoints_ShouldSucceed() {
        LoyaltyDto.EarnRequest request = new LoyaltyDto.EarnRequest(1L, 101L, BigDecimal.valueOf(200000), "Ticket purchase");

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));
        when(accountRepository.findByCustomerId(1L)).thenReturn(Optional.of(loyaltyAccount));
        when(accountRepository.save(any(LoyaltyAccount.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
        when(pointHistoryRepository.save(any(PointHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        // 200,000 / 10,000 = 20 basic points
        // 20 * 1.5 multiplier = 30 points earned
        LoyaltyDto.TransactionResponse result = loyaltyService.earnPoints(request);

        assertThat(result.getPointsEarned()).isEqualTo(30L);
        assertThat(result.getBalanceAfter()).isEqualTo(130L);
        verify(pointHistoryRepository).save(any(PointHistory.class));
    }

    @Test
    void earnPoints_ShouldThrow_WhenNoActiveMembership() {
        LoyaltyDto.EarnRequest request = new LoyaltyDto.EarnRequest(1L, 101L, BigDecimal.valueOf(200000), "Ticket purchase");

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loyaltyService.earnPoints(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void redeemPoints_ShouldSucceed_WhenEnoughBalance() {
        LoyaltyDto.RedeemRequest request = new LoyaltyDto.RedeemRequest(1L, 40L, 102L, "Redeem for drink");

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));
        when(accountRepository.findByCustomerId(1L)).thenReturn(Optional.of(loyaltyAccount));
        when(accountRepository.save(any(LoyaltyAccount.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
        when(pointHistoryRepository.save(any(PointHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        LoyaltyDto.TransactionResponse result = loyaltyService.redeemPoints(request);

        assertThat(result.getPointsRedeemed()).isEqualTo(40L);
        assertThat(result.getBalanceAfter()).isEqualTo(60L);
    }

    @Test
    void redeemPoints_ShouldThrow_WhenNotEnoughPoints() {
        LoyaltyDto.RedeemRequest request = new LoyaltyDto.RedeemRequest(1L, 150L, 102L, "Redeem major item");

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));
        when(accountRepository.findByCustomerId(1L)).thenReturn(Optional.of(loyaltyAccount));

        assertThatThrownBy(() -> loyaltyService.redeemPoints(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void adjustPoints_ShouldSucceed() {
        // Mock Security Context
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("admin_user");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        LoyaltyDto.AdjustRequest request = new LoyaltyDto.AdjustRequest(1L, 50L, "Manual adjustment", null);

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));
        when(accountRepository.findByCustomerId(1L)).thenReturn(Optional.of(loyaltyAccount));
        when(accountRepository.save(any(LoyaltyAccount.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));
        when(pointHistoryRepository.save(any(PointHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        LoyaltyDto.TransactionResponse result = loyaltyService.adjustPoints(request);

        assertThat(result.getBalanceAfter()).isEqualTo(150L);
        assertThat(result.getPerformedBy()).isEqualTo("admin_user");
    }

    @Test
    void adjustPoints_ShouldThrow_WhenFinalBalanceIsNegative() {
        LoyaltyDto.AdjustRequest request = new LoyaltyDto.AdjustRequest(1L, -120L, "Deduct too much", "admin");

        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));
        when(accountRepository.findByCustomerId(1L)).thenReturn(Optional.of(loyaltyAccount));

        assertThatThrownBy(() -> loyaltyService.adjustPoints(request))
                .isInstanceOf(BusinessException.class);
    }
}
