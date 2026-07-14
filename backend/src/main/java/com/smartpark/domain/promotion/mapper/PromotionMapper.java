package com.smartpark.domain.promotion.mapper;

import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.promotion.dto.*;
import com.smartpark.domain.promotion.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PromotionMapper {

    // ─────────────────────── CAMPAIGN MAPPINGS ───────────────────────

    public Campaign toEntity(CampaignRequestDto dto) {
        if (dto == null) return null;
        return Campaign.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .campaignType(dto.getCampaignType())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .budget(dto.getBudget())
                .targetCustomers(dto.getTargetCustomers())
                .status(Campaign.CampaignStatus.valueOf(dto.getStatus().toUpperCase()))
                .build();
    }

    public CampaignResponseDto toResponse(Campaign entity) {
        if (entity == null) return null;
        return CampaignResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .campaignType(entity.getCampaignType())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .budget(entity.getBudget())
                .targetCustomers(entity.getTargetCustomers())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(Campaign entity, CampaignRequestDto dto) {
        if (entity == null || dto == null) return;
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCampaignType(dto.getCampaignType());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setBudget(dto.getBudget());
        entity.setTargetCustomers(dto.getTargetCustomers());
        entity.setStatus(Campaign.CampaignStatus.valueOf(dto.getStatus().toUpperCase()));
    }

    // ─────────────────────── PROMOTION MAPPINGS ───────────────────────

    public Promotion toEntity(PromotionRequestDto dto, Campaign campaign) {
        if (dto == null) return null;
        return Promotion.builder()
                .campaign(campaign)
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .discountType(Promotion.DiscountType.valueOf(dto.getDiscountType().toUpperCase()))
                .value(dto.getValue())
                .maxDiscount(dto.getMaxDiscount())
                .minOrder(dto.getMinOrder())
                .applicableTicketTypes(dto.getApplicableTicketTypes())
                .applicableMembershipTier(dto.getApplicableMembershipTier())
                .validTime(dto.getValidTime())
                .status(Promotion.PromotionStatus.valueOf(dto.getStatus().toUpperCase()))
                .build();
    }

    public PromotionResponseDto toResponse(Promotion entity) {
        if (entity == null) return null;
        return PromotionResponseDto.builder()
                .id(entity.getId())
                .campaignId(entity.getCampaign() != null ? entity.getCampaign().getId() : null)
                .campaignCode(entity.getCampaign() != null ? entity.getCampaign().getCode() : null)
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .discountType(entity.getDiscountType().name())
                .value(entity.getValue())
                .maxDiscount(entity.getMaxDiscount())
                .minOrder(entity.getMinOrder())
                .applicableTicketTypes(entity.getApplicableTicketTypes())
                .applicableMembershipTier(entity.getApplicableMembershipTier())
                .validTime(entity.getValidTime())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public void updateEntity(Promotion entity, PromotionRequestDto dto, Campaign campaign) {
        if (entity == null || dto == null) return;
        entity.setCampaign(campaign);
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setDiscountType(Promotion.DiscountType.valueOf(dto.getDiscountType().toUpperCase()));
        entity.setValue(dto.getValue());
        entity.setMaxDiscount(dto.getMaxDiscount());
        entity.setMinOrder(dto.getMinOrder());
        entity.setApplicableTicketTypes(dto.getApplicableTicketTypes());
        entity.setApplicableMembershipTier(dto.getApplicableMembershipTier());
        entity.setValidTime(dto.getValidTime());
        entity.setStatus(Promotion.PromotionStatus.valueOf(dto.getStatus().toUpperCase()));
    }

    // ─────────────────────── COUPON MAPPINGS ───────────────────────

    public Coupon toEntity(CouponRequestDto dto, Promotion promotion, Customer customer) {
        if (dto == null) return null;
        return Coupon.builder()
                .promotion(promotion)
                .code(dto.getCode())
                .maxUses(dto.getMaxUses())
                .currentUses(0)
                .discountAmount(dto.getDiscountAmount())
                .minOrderValue(dto.getMinOrderValue() != null ? dto.getMinOrderValue() : BigDecimal.ZERO)
                .expirationDate(dto.getExpirationDate())
                .customer(customer)
                .status(Coupon.CouponStatus.valueOf(dto.getStatus().toUpperCase()))
                .build();
    }

    public CouponResponseDto toResponse(Coupon entity) {
        if (entity == null) return null;
        int remaining = entity.getMaxUses() - entity.getCurrentUses();
        return CouponResponseDto.builder()
                .id(entity.getId())
                .promotionId(entity.getPromotion().getId())
                .promotionName(entity.getPromotion().getName())
                .code(entity.getCode())
                .maxUses(entity.getMaxUses())
                .currentUses(entity.getCurrentUses())
                .remainingQuantity(Math.max(0, remaining))
                .discountAmount(entity.getDiscountAmount())
                .minOrderValue(entity.getMinOrderValue())
                .expirationDate(entity.getExpirationDate())
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getId() : null)
                .customerName(entity.getCustomer() != null ? entity.getCustomer().getFullName() : null)
                .status(entity.getStatus().name())
                .build();
    }

    public void updateEntity(Coupon entity, CouponRequestDto dto, Promotion promotion, Customer customer) {
        if (entity == null || dto == null) return;
        entity.setPromotion(promotion);
        entity.setCode(dto.getCode());
        entity.setMaxUses(dto.getMaxUses());
        entity.setDiscountAmount(dto.getDiscountAmount());
        entity.setMinOrderValue(dto.getMinOrderValue() != null ? dto.getMinOrderValue() : BigDecimal.ZERO);
        entity.setExpirationDate(dto.getExpirationDate());
        entity.setCustomer(customer);
        entity.setStatus(Coupon.CouponStatus.valueOf(dto.getStatus().toUpperCase()));
    }

    // ─────────────────────── VOUCHER MAPPINGS ───────────────────────

    public Voucher toEntity(VoucherRequestDto dto, Customer customer) {
        if (dto == null) return null;
        return Voucher.builder()
                .code(dto.getCode())
                .voucherValue(dto.getVoucherValue())
                .remainingBalance(dto.getVoucherValue()) // initially full balance
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .customer(customer)
                .status(Voucher.VoucherStatus.valueOf(dto.getStatus().toUpperCase()))
                .build();
    }

    public VoucherResponseDto toResponse(Voucher entity) {
        if (entity == null) return null;
        return VoucherResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .voucherValue(entity.getVoucherValue())
                .remainingBalance(entity.getRemainingBalance())
                .validFrom(entity.getValidFrom())
                .validTo(entity.getValidTo())
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getId() : null)
                .customerName(entity.getCustomer() != null ? entity.getCustomer().getFullName() : null)
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(Voucher entity, VoucherRequestDto dto, Customer customer) {
        if (entity == null || dto == null) return;
        entity.setCode(dto.getCode());
        entity.setVoucherValue(dto.getVoucherValue());
        // note: remainingBalance is typically managed by transactions but we allow updates
        if (entity.getRemainingBalance().compareTo(dto.getVoucherValue()) > 0) {
            entity.setRemainingBalance(dto.getVoucherValue());
        }
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidTo(dto.getValidTo());
        entity.setCustomer(customer);
        entity.setStatus(Voucher.VoucherStatus.valueOf(dto.getStatus().toUpperCase()));
    }
}
