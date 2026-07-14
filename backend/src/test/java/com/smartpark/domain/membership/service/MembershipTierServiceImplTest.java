package com.smartpark.domain.membership.service;

import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.membership.dto.MembershipTierDto;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.service.impl.MembershipTierServiceImpl;
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
class MembershipTierServiceImplTest {

    @Mock
    private MembershipTierRepository tierRepository;

    @InjectMocks
    private MembershipTierServiceImpl tierService;

    private MembershipTier tier;

    @BeforeEach
    void setUp() {
        tier = MembershipTier.builder()
                .id(1L)
                .code("GOLD")
                .name("Gold Tier")
                .description("Gold level membership benefits")
                .minSpend(BigDecimal.valueOf(5000000))
                .discountPercentage(BigDecimal.valueOf(10))
                .pointsMultiplier(BigDecimal.valueOf(1.5))
                .priorityQueue(true)
                .freeParking(true)
                .birthdayBenefit("Free ticket")
                .loungeAccess(false)
                .sortOrder(2)
                .status(MembershipTier.TierStatus.ACTIVE)
                .build();
    }

    @Test
    void getAll_ShouldReturnPage() {
        PageImpl<MembershipTier> page = new PageImpl<>(List.of(tier));
        when(tierRepository.findAllActive(any(), any(), any())).thenReturn(page);

        Page<MembershipTierDto.Response> result = tierService.getAll("gold", MembershipTier.TierStatus.ACTIVE, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("GOLD");
    }

    @Test
    void getById_ShouldReturnResponse_WhenExists() {
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(tier));

        MembershipTierDto.Response result = tierService.getById(1L);

        assertThat(result.getCode()).isEqualTo("GOLD");
    }

    @Test
    void getById_ShouldThrow_WhenNotFound() {
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tierService.getById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_ShouldSaveAndReturnResponse() {
        MembershipTierDto.CreateRequest request = new MembershipTierDto.CreateRequest(
                "PLATINUM", "Platinum Tier", "Platinum level benefits",
                BigDecimal.valueOf(10000000), BigDecimal.valueOf(15), BigDecimal.valueOf(2.0),
                true, true, "Lounge access", true, 3
        );

        when(tierRepository.findByCode("PLATINUM")).thenReturn(Optional.empty());
        when(tierRepository.save(any(MembershipTier.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipTierDto.Response result = tierService.create(request);

        assertThat(result.getCode()).isEqualTo("PLATINUM");
        assertThat(result.getName()).isEqualTo("Platinum Tier");
        assertThat(result.getMinSpend()).isEqualTo(BigDecimal.valueOf(10000000));
    }

    @Test
    void create_ShouldThrow_WhenCodeExists() {
        MembershipTierDto.CreateRequest request = new MembershipTierDto.CreateRequest(
                "GOLD", "Gold Tier", "Gold level benefits",
                BigDecimal.valueOf(5000000), BigDecimal.valueOf(10), BigDecimal.valueOf(1.5),
                true, true, "Free ticket", false, 2
        );

        when(tierRepository.findByCode("GOLD")).thenReturn(Optional.of(tier));

        assertThatThrownBy(() -> tierService.create(request))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void update_ShouldModifyAndSave() {
        MembershipTierDto.UpdateRequest request = new MembershipTierDto.UpdateRequest(
                "Updated Gold", "Updated description", BigDecimal.valueOf(6000000),
                BigDecimal.valueOf(12), BigDecimal.valueOf(1.8), true, true, "Gift", true, 2
        );

        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(tier));
        when(tierRepository.save(any(MembershipTier.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipTierDto.Response result = tierService.update(1L, request);

        assertThat(result.getName()).isEqualTo("Updated Gold");
        assertThat(result.getDescription()).isEqualTo("Updated description");
        assertThat(result.getMinSpend()).isEqualTo(BigDecimal.valueOf(6000000));
        assertThat(result.getLoungeAccess()).isTrue();
    }

    @Test
    void delete_ShouldMarkAsDeleted() {
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(tier));
        when(tierRepository.save(any(MembershipTier.class))).thenAnswer(inv -> inv.getArgument(0));

        tierService.delete(1L);

        assertThat(tier.getDeletedAt()).isNotNull();
        assertThat(tier.getStatus()).isEqualTo(MembershipTier.TierStatus.INACTIVE);
    }

    @Test
    void updateStatus_ShouldChangeStatus() {
        MembershipTierDto.StatusRequest request = new MembershipTierDto.StatusRequest(MembershipTier.TierStatus.INACTIVE);
        when(tierRepository.findByIdAndNotDeleted(1L)).thenReturn(Optional.of(tier));
        when(tierRepository.save(any(MembershipTier.class))).thenAnswer(inv -> inv.getArgument(0));

        MembershipTierDto.Response result = tierService.updateStatus(1L, request);

        assertThat(result.getStatus()).isEqualTo(MembershipTier.TierStatus.INACTIVE);
    }
}
