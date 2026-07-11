package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.promotion.entity.Coupon;
import com.smartpark.domain.promotion.entity.CouponUsage;
import com.smartpark.domain.promotion.entity.Promotion;
import com.smartpark.domain.promotion.repository.CouponRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.repository.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock private PromotionRepository promotionRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private CouponUsageRepository couponUsageRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private AnalyticsEventPublisher analyticsEventPublisher;

    @InjectMocks
    private PromotionService promotionService;

    private Promotion promotion;
    private Coupon coupon;
    private Customer customer;

    @BeforeEach
    void setUp() {
        promotion = new Promotion();
        promotion.setId(1L);
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);
        promotion.setStartDate(LocalDate.now().minusDays(1));
        promotion.setEndDate(LocalDate.now().plusDays(10));
        promotion.setDiscountType(Promotion.DiscountType.FIXED_AMOUNT);

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
}
