package com.smartpark.domain.membership.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.dto.MembershipDto;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.service.impl.MembershipManagementServiceImpl;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipManagementServiceImplTest {

    @Mock private MembershipRepository membershipRepository;
    @Mock private MembershipTierRepository tierRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks
    private MembershipManagementServiceImpl managementService;

    private Customer customer;
    private MembershipTier goldTier;
    private MembershipTier platinumTier;
    private Membership membership;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .fullName("John Doe")
                .build();

        goldTier = MembershipTier.builder()
                .id(1L)
                .code("GOLD")
                .name("Gold Tier")
                .sortOrder(2)
                .build();

        platinumTier = MembershipTier.builder()
                .id(2L)
                .code("PLATINUM")
                .name("Platinum Tier")
                .sortOrder(3)
                .build();

        membership = Membership.builder()
                .id(1L)
                .membershipCode("MEM-00000001-9999")
                .customer(customer)
                .tier(goldTier)
                .joinDate(LocalDate.now())
                .startDate(LocalDate.now())
                .expirationDate(LocalDate.now().plusYears(1))
                .autoRenewal(false)
                .points(100L)
                .currentSpending(BigDecimal.ZERO)
                .lifetimeSpending(BigDecimal.ZERO)
                .status(Membership.MembershipStatus.ACTIVE)
                .build();
    }

    @Test
    void getAll_ShouldReturnPage() {
        PageImpl<Membership> page = new PageImpl<>(List.of(membership));
        when(membershipRepository.findAllWithFilters(any(), any(), any(), any(), any(), any())).thenReturn(page);

        Page<MembershipDto.Response> result = managementService.getAll("John", null, null, null, null, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getMembershipCode()).isEqualTo("MEM-00000001-9999");
    }

    @Test
    void getById_ShouldReturnResponse_WhenExists() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));

        MembershipDto.Response result = managementService.getById(1L);

        assertThat(result.getMembershipCode()).isEqualTo("MEM-00000001-9999");
    }

    @Test
    void getById_ShouldThrow_WhenNotFound() {
        when(membershipRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> managementService.getById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_ShouldSave_WhenNoActiveMembership() {
        MembershipDto.CreateRequest request = new MembershipDto.CreateRequest(1L, 1L, LocalDate.now(), null, false);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.empty());
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(goldTier));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> {
            Membership m = inv.getArgument(0);
            m.setId(2L);
            return m;
        });

        MembershipDto.Response result = managementService.create(request);

        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getMembershipCode()).startsWith("MEM-00000001-");
    }

    @Test
    void create_ShouldThrow_WhenActiveMembershipExists() {
        MembershipDto.CreateRequest request = new MembershipDto.CreateRequest(1L, 1L, LocalDate.now(), null, false);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomerIdAndStatus(1L, Membership.MembershipStatus.ACTIVE)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> managementService.create(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void upgrade_ShouldSucceed_WhenNewTierIsHigher() {
        MembershipDto.UpgradeRequest request = new MembershipDto.UpgradeRequest(2L);

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        when(tierRepository.findByIdAndNotDeleted(2L)).thenReturn(Optional.of(platinumTier));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipDto.Response result = managementService.upgrade(1L, request);

        assertThat(result.getTierCode()).isEqualTo("PLATINUM");
    }

    @Test
    void upgrade_ShouldThrow_WhenNewTierIsSameOrLower() {
        MembershipDto.UpgradeRequest request = new MembershipDto.UpgradeRequest(1L);

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(goldTier));

        assertThatThrownBy(() -> managementService.upgrade(1L, request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void renew_ShouldExtendExpiryDate() {
        MembershipDto.RenewRequest request = new MembershipDto.RenewRequest(6);
        LocalDate futureExpiry = LocalDate.now().plusDays(1);
        membership.setExpirationDate(futureExpiry);

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipDto.Response result = managementService.renew(1L, request);

        assertThat(result.getExpirationDate()).isEqualTo(futureExpiry.plusMonths(6));
        assertThat(result.getRenewalCount()).isEqualTo(1);
    }

    @Test
    void renew_ShouldThrow_WhenExpiredBeyondGracePeriod() {
        MembershipDto.RenewRequest request = new MembershipDto.RenewRequest(12);
        membership.setExpirationDate(LocalDate.now().minusDays(31));

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> managementService.renew(1L, request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void cancel_ShouldSetStatusToCancelled() {
        MembershipDto.CancelRequest request = new MembershipDto.CancelRequest("No longer needed");

        when(membershipRepository.findById(1L)).thenReturn(Optional.of(membership));
        when(membershipRepository.save(any(Membership.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipDto.Response result = managementService.cancel(1L, request);

        assertThat(result.getStatus()).isEqualTo(Membership.MembershipStatus.CANCELLED);
        assertThat(result.getCancelledAt()).isNotNull();
    }
}
