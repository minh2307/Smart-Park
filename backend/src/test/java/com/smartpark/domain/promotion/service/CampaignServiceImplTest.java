package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.promotion.dto.CampaignRequestDto;
import com.smartpark.domain.promotion.dto.CampaignResponseDto;
import com.smartpark.domain.promotion.dto.CampaignStatisticsDto;
import com.smartpark.domain.promotion.entity.Campaign;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.repository.CampaignRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.service.impl.CampaignServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CampaignServiceImplTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private PromotionMapper promotionMapper;

    @InjectMocks
    private CampaignServiceImpl campaignService;

    private Campaign campaign;
    private CampaignRequestDto requestDto;
    private CampaignResponseDto responseDto;

    @BeforeEach
    void setUp() {
        campaign = Campaign.builder()
                .id(1L)
                .code("CAMP1")
                .name("Spring Campaign")
                .description("Spring Discount")
                .campaignType("SEASONAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .budget(BigDecimal.valueOf(1000000))
                .targetCustomers("ALL")
                .status(Campaign.CampaignStatus.ACTIVE)
                .build();

        requestDto = CampaignRequestDto.builder()
                .code("CAMP1")
                .name("Spring Campaign")
                .description("Spring Discount")
                .campaignType("SEASONAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .budget(BigDecimal.valueOf(1000000))
                .targetCustomers("ALL")
                .status("ACTIVE")
                .build();

        responseDto = CampaignResponseDto.builder()
                .id(1L)
                .code("CAMP1")
                .name("Spring Campaign")
                .description("Spring Discount")
                .campaignType("SEASONAL")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .budget(BigDecimal.valueOf(1000000))
                .targetCustomers("ALL")
                .status("ACTIVE")
                .build();
    }

    @Test
    void findAll_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Campaign> page = new PageImpl<>(Collections.singletonList(campaign));

        when(campaignRepository.findAllWithFilters(any(), any(), any(), any(), any(), eq(pageable))).thenReturn(page);
        when(promotionMapper.toResponse(any(Campaign.class))).thenReturn(responseDto);

        Page<CampaignResponseDto> result = campaignService.findAll("search", "SEASONAL", "ACTIVE", LocalDate.now(), LocalDate.now().plusDays(5), pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCode()).isEqualTo("CAMP1");
    }

    @Test
    void findById_ShouldReturnCampaign() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(promotionMapper.toResponse(campaign)).thenReturn(responseDto);

        CampaignResponseDto result = campaignService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void findById_ShouldThrow_WhenNotFound() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> campaignService.findById(1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_ShouldSave_WhenValid() {
        when(campaignRepository.existsByCode("CAMP1")).thenReturn(false);
        when(promotionMapper.toEntity(requestDto)).thenReturn(campaign);
        when(campaignRepository.save(campaign)).thenReturn(campaign);
        when(promotionMapper.toResponse(campaign)).thenReturn(responseDto);

        CampaignResponseDto result = campaignService.create(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("CAMP1");
        verify(campaignRepository).save(campaign);
    }

    @Test
    void create_ShouldThrow_WhenCodeExists() {
        when(campaignRepository.existsByCode("CAMP1")).thenReturn(true);

        assertThatThrownBy(() -> campaignService.create(requestDto))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void create_ShouldThrow_WhenEndDateBeforeStartDate() {
        requestDto.setEndDate(LocalDate.now().minusDays(1));
        when(campaignRepository.existsByCode("CAMP1")).thenReturn(false);

        assertThatThrownBy(() -> campaignService.create(requestDto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void update_ShouldSave_WhenValid() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);
        when(promotionMapper.toResponse(campaign)).thenReturn(responseDto);

        CampaignResponseDto result = campaignService.update(1L, requestDto);

        assertThat(result).isNotNull();
        verify(promotionMapper).updateEntity(campaign, requestDto);
    }

    @Test
    void update_ShouldThrow_WhenCodeExists() {
        requestDto.setCode("NEW_CAMP");
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.existsByCode("NEW_CAMP")).thenReturn(true);

        assertThatThrownBy(() -> campaignService.update(1L, requestDto))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void delete_ShouldSetInactive() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));

        campaignService.delete(1L);

        assertThat(campaign.getStatus()).isEqualTo(Campaign.CampaignStatus.INACTIVE);
        verify(campaignRepository).save(campaign);
    }

    @Test
    void activate_ShouldSetActive() {
        campaign.setStatus(Campaign.CampaignStatus.INACTIVE);
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);
        when(promotionMapper.toResponse(campaign)).thenReturn(responseDto);

        CampaignResponseDto result = campaignService.activate(1L);

        assertThat(campaign.getStatus()).isEqualTo(Campaign.CampaignStatus.ACTIVE);
    }

    @Test
    void deactivate_ShouldSetInactive() {
        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);
        when(promotionMapper.toResponse(campaign)).thenReturn(responseDto);

        CampaignResponseDto result = campaignService.deactivate(1L);

        assertThat(campaign.getStatus()).isEqualTo(Campaign.CampaignStatus.INACTIVE);
    }

    @Test
    void getStatistics_ShouldReturnCorrectData() {
        when(campaignRepository.findAll()).thenReturn(Collections.singletonList(campaign));
        when(couponUsageRepository.count()).thenReturn(5L);
        when(couponUsageRepository.findAll()).thenReturn(Collections.emptyList());

        CampaignStatisticsDto stats = campaignService.getStatistics();

        assertThat(stats.getTotalCampaigns()).isEqualTo(1L);
        assertThat(stats.getActiveCampaigns()).isEqualTo(1L);
        assertThat(stats.getTotalBudget()).isEqualByComparingTo(BigDecimal.valueOf(1000000));
        assertThat(stats.getTotalCouponUsages()).isEqualTo(5L);
        assertThat(stats.getTotalCouponDiscounts()).isZero();
    }
}
