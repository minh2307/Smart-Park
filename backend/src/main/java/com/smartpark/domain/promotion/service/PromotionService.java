package com.smartpark.domain.promotion.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
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
import com.smartpark.domain.membership.service.MembershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartpark.domain.bi.entity.AnalyticsEvent;
import com.smartpark.domain.bi.service.AnalyticsEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CustomerRepository customerRepository;
    private final CampaignRepository campaignRepository;
    private final MembershipService membershipService;
    private final PromotionMapper promotionMapper;
    private final AnalyticsEventPublisher analyticsEventPublisher;

    @Transactional(readOnly = true)
    public Page<Promotion> findAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Promotion> findAllPromotions(Long campaignId, String search, String status, String discountType, Pageable pageable) {
        Promotion.PromotionStatus promotionStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                promotionStatus = Promotion.PromotionStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        Promotion.DiscountType type = null;
        if (discountType != null && !discountType.trim().isEmpty()) {
            try {
                type = Promotion.DiscountType.valueOf(discountType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        return promotionRepository.findAllWithFilters(campaignId, search, promotionStatus, type, pageable);
    }

    @Transactional(readOnly = true)
    public Promotion findPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
    }

    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion createPromotion(PromotionRequestDto request) {
        log.info("[PROMOTION CREATE] code={}, name={}", request.getCode(), request.getName());
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("ERR-PROMO-007", "Ngày kết thúc phải sau ngày bắt đầu.");
        }
        if (promotionRepository.findAll().stream().anyMatch(p -> p.getCode() != null && p.getCode().equalsIgnoreCase(request.getCode()))) {
            throw new ConflictException("ERR-PROMO-008", "Mã khuyến mãi đã tồn tại: " + request.getCode());
        }
        if (request.getDiscountType().equalsIgnoreCase("PERCENTAGE") && request.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("ERR-PROMO-009", "Phần trăm giảm giá không được vượt quá 100%.");
        }

        Campaign campaign = null;
        if (request.getCampaignId() != null) {
            campaign = campaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign", request.getCampaignId()));
        }

        Promotion promotion = promotionMapper.toEntity(request, campaign);
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion updatePromotion(Long id, PromotionRequestDto request) {
        log.info("[PROMOTION UPDATE] id={}", id);
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("ERR-PROMO-007", "Ngày kết thúc phải sau ngày bắt đầu.");
        }
        if (request.getDiscountType().equalsIgnoreCase("PERCENTAGE") && request.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("ERR-PROMO-009", "Phần trăm giảm giá không được vượt quá 100%.");
        }

        Campaign campaign = null;
        if (request.getCampaignId() != null) {
            campaign = campaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign", request.getCampaignId()));
        }

        promotionMapper.updateEntity(promotion, request, campaign);
        return promotionRepository.save(promotion);
    }

    @Transactional
    public void deletePromotion(Long id) {
        log.info("[PROMOTION DELETE] id={}", id);
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
        promotion.setStatus(Promotion.PromotionStatus.INACTIVE);
        promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion activatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
        promotion.setStatus(Promotion.PromotionStatus.ACTIVE);
        return promotionRepository.save(promotion);
    }

    @Transactional
    public Promotion deactivatePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
        promotion.setStatus(Promotion.PromotionStatus.INACTIVE);
        return promotionRepository.save(promotion);
    }

    @Transactional(readOnly = true)
    public Page<Coupon> findAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Coupon> findAllCoupons(String search, Long promotionId, String status, Pageable pageable) {
        Coupon.CouponStatus couponStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                couponStatus = Coupon.CouponStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore
            }
        }
        return couponRepository.findAllWithFilters(search, promotionId, couponStatus, pageable);
    }

    @Transactional(readOnly = true)
    public Coupon findCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", code));
    }

    @Transactional(readOnly = true)
    public Coupon findCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
    }

    @Transactional
    public Coupon createCoupon(Long promotionId, Coupon coupon) {
        Promotion promotion = findPromotionById(promotionId);
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new BusinessException("Mã giảm giá '" + coupon.getCode() + "' đã tồn tại.");
        }
        coupon.setPromotion(promotion);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon createCoupon(CouponRequestDto request) {
        log.info("[COUPON CREATE] code={}", request.getCode());
        Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", request.getPromotionId()));

        if (couponRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-COUP-001", "Mã Coupon đã tồn tại: " + request.getCode());
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        Coupon coupon = promotionMapper.toEntity(request, promotion, customer);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, CouponRequestDto request) {
        log.info("[COUPON UPDATE] id={}", id);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));

        Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", request.getPromotionId()));

        if (!coupon.getCode().equals(request.getCode()) && couponRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-COUP-001", "Mã Coupon đã tồn tại: " + request.getCode());
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        promotionMapper.updateEntity(coupon, request, promotion, customer);
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        log.info("[COUPON DELETE] id={}", id);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        coupon.setStatus(Coupon.CouponStatus.DISABLED);
        couponRepository.save(coupon);
    }

    @Transactional
    public Coupon disableCoupon(Long id) {
        log.info("[COUPON DISABLE] id={}", id);
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
        coupon.setStatus(Coupon.CouponStatus.DISABLED);
        return couponRepository.save(coupon);
    }

    // ─────────────────────── COUPON VALIDATION ───────────────────────

    /**
     * Xác thực mã giảm giá và trả về số tiền được giảm.
     */
    @Transactional(readOnly = true)
    public BigDecimal validateAndCalculateDiscount(String code, Long customerId, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ConflictException("ERR-PROMO-001", "Mã giảm giá không tồn tại."));

        Promotion promotion = coupon.getPromotion();
        LocalDate today = LocalDate.now();

        if (promotion.getStatus() != Promotion.PromotionStatus.ACTIVE || 
            today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            throw new ConflictException("ERR-PROMO-002", "Chương trình khuyến mãi đã kết thúc hoặc chưa bắt đầu.");
        }

        if (coupon.getStatus() != Coupon.CouponStatus.ACTIVE) {
            throw new ConflictException("ERR-PROMO-003", "Mã giảm giá không còn hiệu lực.");
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new ConflictException("ERR-PROMO-004", "Mã giảm giá đã hết lượt sử dụng.");
        }

        if (coupon.getMinOrderValue() != null && orderTotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ConflictException("ERR-PROMO-005", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã.");
        }

        if (couponUsageRepository.existsByCouponIdAndCustomerId(coupon.getId(), customerId)) {
            throw new ConflictException("ERR-PROMO-006", "Bạn đã sử dụng mã giảm giá này rồi.");
        }

        if (coupon.getExpirationDate() != null && today.isAfter(coupon.getExpirationDate())) {
            throw new ConflictException("ERR-PROMO-013", "Mã giảm giá đã hết hạn sử dụng.");
        }

        if (coupon.getCustomer() != null && !coupon.getCustomer().getId().equals(customerId)) {
            throw new ConflictException("ERR-PROMO-012", "Mã giảm giá này không dành cho bạn.");
        }

        // Tính toán discount
        BigDecimal discount = BigDecimal.ZERO;
        if (promotion.getDiscountType() == Promotion.DiscountType.FIXED_AMOUNT) {
            discount = coupon.getDiscountAmount();
        } else if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            // Giảm theo % nhưng tối đa bằng discountAmount
            BigDecimal percentageDiscount = orderTotal.multiply(promotion.getValue()).divide(BigDecimal.valueOf(100));
            discount = percentageDiscount.min(coupon.getDiscountAmount());
        }

        // Đảm bảo không giảm quá giá trị đơn hàng
        return discount.min(orderTotal);
    }

    @Transactional
    public void recordCouponUsage(String code, Long customerId, Long bookingId) {
        Coupon coupon = findCouponByCode(code);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException("Khách hàng không tồn tại."));

        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .customer(customer)
                .bookingId(bookingId)
                .build();
        
        couponUsageRepository.save(usage);

        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            coupon.setStatus(Coupon.CouponStatus.EXHAUSTED);
        }
        couponRepository.save(coupon);

        log.info("[COUPON_USED] Customer {} used coupon {} for booking {}", customerId, code, bookingId);

        // Trigger COUPON_USED
        analyticsEventPublisher.publish(
                AnalyticsEvent.EventType.COUPON_USED,
                customerId,
                "Coupon",
                coupon.getId(),
                coupon.getDiscountAmount(),
                java.util.Map.of("discountAmount", coupon.getDiscountAmount())
        );
    }

    @Transactional(readOnly = true)
    public BigDecimal validateAndCalculatePromotion(String code, Long customerId, BigDecimal orderTotal, List<Long> ticketTypeIds) {
        Promotion promotion = promotionRepository.findAll().stream()
                .filter(p -> p.getCode() != null && p.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseThrow(() -> new ConflictException("ERR-PROMO-001", "Chương trình khuyến mãi không tồn tại."));

        LocalDate today = LocalDate.now();
        if (promotion.getStatus() != Promotion.PromotionStatus.ACTIVE || 
            today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            throw new ConflictException("ERR-PROMO-002", "Chương trình khuyến mãi đã kết thúc hoặc chưa bắt đầu.");
        }

        // Validate Minimum Order
        if (promotion.getMinOrder() != null && orderTotal.compareTo(promotion.getMinOrder()) < 0) {
            throw new ConflictException("ERR-PROMO-005", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng khuyến mãi.");
        }

        // Validate Membership Tier
        if (promotion.getApplicableMembershipTier() != null && !promotion.getApplicableMembershipTier().trim().isEmpty()) {
            String customerTier = null;
            try {
                com.smartpark.domain.membership.entity.Membership membership = membershipService.findByCustomerId(customerId);
                if (membership != null && membership.getTier() != null) {
                    customerTier = membership.getTier().getName();
                }
            } catch (Exception e) {
                throw new ConflictException("ERR-PROMO-010", "Không thể xác thực hạng thành viên.");
            }
            if (customerTier == null) {
                throw new ConflictException("ERR-PROMO-010", "Không thể xác thực hạng thành viên.");
            }
            if (!promotion.getApplicableMembershipTier().equalsIgnoreCase(customerTier)) {
                throw new ConflictException("ERR-PROMO-010", "Hạng thành viên của bạn không được áp dụng khuyến mãi này.");
            }
        }

        // Validate Ticket Types
        if (promotion.getApplicableTicketTypes() != null && !promotion.getApplicableTicketTypes().trim().isEmpty()) {
            if (ticketTypeIds == null || ticketTypeIds.isEmpty()) {
                throw new ConflictException("ERR-PROMO-011", "Đơn hàng không chứa loại vé hợp lệ cho khuyến mãi này.");
            }
            java.util.Set<String> applicableTypes = new java.util.HashSet<>(java.util.Arrays.asList(promotion.getApplicableTicketTypes().split(",")));
            boolean hasApplicable = ticketTypeIds.stream().anyMatch(id -> applicableTypes.contains(id.toString()));
            if (!hasApplicable) {
                throw new ConflictException("ERR-PROMO-011", "Đơn hàng không chứa loại vé hợp lệ cho khuyến mãi này.");
            }
        }

        // Calculate Discount
        BigDecimal discount = BigDecimal.ZERO;
        if (promotion.getDiscountType() == Promotion.DiscountType.FIXED_AMOUNT) {
            discount = promotion.getValue();
        } else if (promotion.getDiscountType() == Promotion.DiscountType.PERCENTAGE) {
            BigDecimal percentageDiscount = orderTotal.multiply(promotion.getValue()).divide(BigDecimal.valueOf(100));
            if (promotion.getMaxDiscount() != null) {
                discount = percentageDiscount.min(promotion.getMaxDiscount());
            } else {
                discount = percentageDiscount;
            }
        }

        return discount.min(orderTotal);
    }
}
