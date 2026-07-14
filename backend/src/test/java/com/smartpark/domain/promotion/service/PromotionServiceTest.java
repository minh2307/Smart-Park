package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.promotion.dto.CouponRequestDto;
import com.smartpark.domain.promotion.dto.PromotionRequestDto;
import com.smartpark.domain.promotion.entity.Campaign;
import com.smartpark.domain.promotion.entity.Coupon;
import com.smartpark.domain.promotion.entity.CouponUsage;
import com.smartpark.domain.promotion.entity.Promotion;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.repository.CampaignRepository;
import com.smartpark.domain.promotion.repository.CouponRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.PromotionRepository;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.service.MembershipService;
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
import java.util.Optional;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock private PromotionRepository promotionRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private CampaignRepository campaignRepository;
    @Mock private MembershipService membershipService;
    @Mock private PromotionMapper promotionMapper;
    @Mock private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private PromotionService promotionService;

    private Promotion promotion;
    private Coupon coupon;
    private Customer customer;
    private Campaign campaign;

    @BeforeEach
    void setUp() {
        campaign = Campaign.builder().id(10L).code("CAMP_SUMMER").build();

        promotion = new Promotion();
        promotion.setId(1L);
        promotion.setCode("PROMO_SUMMER");
        promotion.setName("Summer Promo");
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);
        promotion.setStartDate(LocalDate.now().minusDays(1));
        promotion.setEndDate(LocalDate.now().plusDays(10));
        promotion.setDiscountType(Promotion.DiscountType.FIXED_AMOUNT);
        promotion.setValue(BigDecimal.valueOf(50000));
        promotion.setCampaign(campaign);

        coupon = new Coupon();
        coupon.setId(1L);
        coupon.setCode("SUMMER24");
        coupon.setPromotion(promotion);
        coupon.setStatus(Coupon.CouponStatus.ACTIVE);
        coupon.setMaxUses(100);
        coupon.setCurrentUses(0);
        coupon.setDiscountAmount(BigDecimal.valueOf(50000));
        coupon.setMinOrderValue(BigDecimal.valueOf(200000));

        customer = new Customer();
        customer.setId(100L);
    }

    @Test
    void validateAndCalculateDiscount_ShouldReturnDiscount_WhenValid() {
        when(couponRepository.findByCode("SUMMER24")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponIdAndCustomerId(1L, 100L)).thenReturn(false);

        BigDecimal discount = promotionService.validateAndCalculateDiscount("SUMMER24", 100L, BigDecimal.valueOf(300000));
        assertThat(discount).isEqualByComparingTo("50000");
    }

    @Test
    void validateAndCalculateDiscount_ShouldThrow_WhenPromotionInactive() {
        promotion.setStatus(Promotion.PromotionStatus.INACTIVE);
        when(couponRepository.findByCode("SUMMER24")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> promotionService.validateAndCalculateDiscount("SUMMER24", 100L, BigDecimal.valueOf(300000)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("kết thúc hoặc chưa bắt đầu");
    }

    @Test
    void validateAndCalculateDiscount_ShouldThrow_WhenMinOrderNotMet() {
        when(couponRepository.findByCode("SUMMER24")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> promotionService.validateAndCalculateDiscount("SUMMER24", 100L, BigDecimal.valueOf(100000)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("chưa đạt giá trị tối thiểu");
    }

    @Test
    void validateAndCalculateDiscount_ShouldThrow_WhenAlreadyUsed() {
        when(couponRepository.findByCode("SUMMER24")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponIdAndCustomerId(1L, 100L)).thenReturn(true);

        assertThatThrownBy(() -> promotionService.validateAndCalculateDiscount("SUMMER24", 100L, BigDecimal.valueOf(300000)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("đã sử dụng mã giảm giá này");
    }

    @Test
    void recordCouponUsage_ShouldRecordAndPublishEvent() {
        when(couponRepository.findByCode("SUMMER24")).thenReturn(Optional.of(coupon));
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(couponRepository.save(any(Coupon.class))).thenReturn(coupon);
        when(couponUsageRepository.save(any(CouponUsage.class))).thenReturn(new CouponUsage());

        promotionService.recordCouponUsage("SUMMER24", 100L, 999L);

        assertThat(coupon.getCurrentUses()).isEqualTo(1);
        verify(couponUsageRepository).save(any(CouponUsage.class));
        verify(analyticsEventPublisher).publish(any(), any(), any(), any(), any(), any());
    }

    @Test
    void findAllPromotions_WithFilters_ShouldReturnPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Promotion> page = new PageImpl<>(Collections.singletonList(promotion));
        when(promotionRepository.findAllWithFilters(any(), any(), any(), any(), eq(pageable))).thenReturn(page);

        Page<Promotion> result = promotionService.findAllPromotions(10L, "search", "ACTIVE", "FIXED_AMOUNT", pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void createPromotion_ShouldSave_WhenValid() {
        PromotionRequestDto dto = PromotionRequestDto.builder()
                .code("NEW_PROMO")
                .name("New Promo")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .discountType("PERCENTAGE")
                .value(BigDecimal.valueOf(50))
                .campaignId(10L)
                .status("ACTIVE")
                .build();

        when(campaignRepository.findById(10L)).thenReturn(Optional.of(campaign));
        when(promotionMapper.toEntity(dto, campaign)).thenReturn(promotion);
        when(promotionRepository.save(promotion)).thenReturn(promotion);

        Promotion result = promotionService.createPromotion(dto);

        assertThat(result).isNotNull();
        verify(promotionRepository).save(promotion);
    }

    @Test
    void createPromotion_ShouldThrow_WhenEndDateBeforeStartDate() {
        PromotionRequestDto dto = PromotionRequestDto.builder()
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().minusDays(1))
                .build();

        assertThatThrownBy(() -> promotionService.createPromotion(dto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void createPromotion_ShouldThrow_WhenPercentageExceeds100() {
        PromotionRequestDto dto = PromotionRequestDto.builder()
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .discountType("PERCENTAGE")
                .value(BigDecimal.valueOf(110))
                .build();

        assertThatThrownBy(() -> promotionService.createPromotion(dto))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void updatePromotion_ShouldSave_WhenValid() {
        PromotionRequestDto dto = PromotionRequestDto.builder()
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(10))
                .discountType("FIXED_AMOUNT")
                .value(BigDecimal.valueOf(50000))
                .campaignId(10L)
                .build();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promotion));
        when(campaignRepository.findById(10L)).thenReturn(Optional.of(campaign));
        when(promotionRepository.save(promotion)).thenReturn(promotion);

        Promotion result = promotionService.updatePromotion(1L, dto);

        assertThat(result).isNotNull();
        verify(promotionMapper).updateEntity(promotion, dto, campaign);
    }

    @Test
    void deletePromotion_ShouldSetInactive() {
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promotion));
        when(promotionRepository.save(promotion)).thenReturn(promotion);

        promotionService.deletePromotion(1L);

        assertThat(promotion.getStatus()).isEqualTo(Promotion.PromotionStatus.INACTIVE);
    }

    @Test
    void activatePromotion_ShouldSetActive() {
        promotion.setStatus(Promotion.PromotionStatus.INACTIVE);
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promotion));
        when(promotionRepository.save(promotion)).thenReturn(promotion);

        Promotion result = promotionService.activatePromotion(1L);

        assertThat(result.getStatus()).isEqualTo(Promotion.PromotionStatus.ACTIVE);
    }

    @Test
    void deactivatePromotion_ShouldSetInactive() {
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promotion));
        when(promotionRepository.save(promotion)).thenReturn(promotion);

        Promotion result = promotionService.deactivatePromotion(1L);

        assertThat(result.getStatus()).isEqualTo(Promotion.PromotionStatus.INACTIVE);
    }

    @Test
    void validateAndCalculatePromotion_ShouldReturnDiscount_WhenValid() {
        promotion.setDiscountType(Promotion.DiscountType.PERCENTAGE);
        promotion.setValue(BigDecimal.valueOf(10)); // 10%
        promotion.setMaxDiscount(BigDecimal.valueOf(30000));
        promotion.setMinOrder(BigDecimal.valueOf(100000));
        promotion.setApplicableTicketTypes("1,2");
        promotion.setApplicableMembershipTier("GOLD");

        when(promotionRepository.findAll()).thenReturn(Collections.singletonList(promotion));

        // Mock Membership
        MembershipTier tier = new MembershipTier();
        tier.setName("GOLD");
        Membership membership = new Membership();
        membership.setTier(tier);
        when(membershipService.findByCustomerId(100L)).thenReturn(membership);

        BigDecimal discount = promotionService.validateAndCalculatePromotion("PROMO_SUMMER", 100L, BigDecimal.valueOf(200000), Arrays.asList(1L, 3L));

        // 10% of 200,000 is 20,000, which is below max discount 30,000
        assertThat(discount).isEqualByComparingTo("20000");
    }

    @Test
    void validateAndCalculatePromotion_ShouldThrow_WhenMembershipTierMismatch() {
        promotion.setApplicableMembershipTier("GOLD");
        when(promotionRepository.findAll()).thenReturn(Collections.singletonList(promotion));

        MembershipTier tier = new MembershipTier();
        tier.setName("SILVER");
        Membership membership = new Membership();
        membership.setTier(tier);
        when(membershipService.findByCustomerId(100L)).thenReturn(membership);

        assertThatThrownBy(() -> promotionService.validateAndCalculatePromotion("PROMO_SUMMER", 100L, BigDecimal.valueOf(200000), Arrays.asList(1L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Hạng thành viên của bạn không được áp dụng");
    }

    @Test
    void validateAndCalculatePromotion_ShouldThrow_WhenTicketTypeMismatch() {
        promotion.setApplicableTicketTypes("1,2");
        when(promotionRepository.findAll()).thenReturn(Collections.singletonList(promotion));

        assertThatThrownBy(() -> promotionService.validateAndCalculatePromotion("PROMO_SUMMER", 100L, BigDecimal.valueOf(200000), Arrays.asList(3L, 4L)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Đơn hàng không chứa loại vé hợp lệ");
    }

    @Test
    void createCoupon_ShouldSave_WhenValid() {
        CouponRequestDto request = CouponRequestDto.builder()
                .code("NEW_COUP")
                .promotionId(1L)
                .customerId(100L)
                .maxUses(5)
                .discountAmount(BigDecimal.valueOf(10000))
                .minOrderValue(BigDecimal.valueOf(50000))
                .expirationDate(LocalDate.now().plusDays(5))
                .status("ACTIVE")
                .build();

        when(promotionRepository.findById(1L)).thenReturn(Optional.of(promotion));
        when(customerRepository.findById(100L)).thenReturn(Optional.of(customer));
        when(couponRepository.existsByCode("NEW_COUP")).thenReturn(false);
        when(promotionMapper.toEntity(request, promotion, customer)).thenReturn(coupon);
        when(couponRepository.save(coupon)).thenReturn(coupon);

        Coupon result = promotionService.createCoupon(request);

        assertThat(result).isNotNull();
        verify(couponRepository).save(coupon);
    }
}
