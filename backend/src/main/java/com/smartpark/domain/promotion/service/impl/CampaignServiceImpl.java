package com.smartpark.domain.promotion.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.promotion.dto.CampaignRequestDto;
import com.smartpark.domain.promotion.dto.CampaignResponseDto;
import com.smartpark.domain.promotion.dto.CampaignStatisticsDto;
import com.smartpark.domain.promotion.entity.Campaign;
import com.smartpark.domain.promotion.mapper.PromotionMapper;
import com.smartpark.domain.promotion.repository.CampaignRepository;
import com.smartpark.domain.promotion.repository.CouponRepository;
import com.smartpark.domain.promotion.repository.CouponUsageRepository;
import com.smartpark.domain.promotion.service.CampaignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CampaignServiceImpl implements CampaignService {

    private final CampaignRepository campaignRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<CampaignResponseDto> findAll(String search, String campaignType, String status, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        Campaign.CampaignStatus campaignStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                campaignStatus = Campaign.CampaignStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // ignore invalid status
            }
        }
        return campaignRepository.findAllWithFilters(search, campaignType, campaignStatus, startDate, endDate, pageable)
                .map(promotionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignResponseDto findById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
        return promotionMapper.toResponse(campaign);
    }

    @Override
    @Transactional
    public CampaignResponseDto create(CampaignRequestDto request) {
        log.info("[CAMPAIGN CREATE] code={}, name={}", request.getCode(), request.getName());
        if (campaignRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-CAMP-001", "Mã chiến dịch đã tồn tại: " + request.getCode());
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("ERR-CAMP-002", "Ngày kết thúc phải sau ngày bắt đầu.");
        }

        Campaign campaign = promotionMapper.toEntity(request);
        Campaign saved = campaignRepository.save(campaign);
        log.info("[CAMPAIGN CREATED] id={}", saved.getId());
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CampaignResponseDto update(Long id, CampaignRequestDto request) {
        log.info("[CAMPAIGN UPDATE] id={}, code={}", id, request.getCode());
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));

        // Check code uniqueness if changed
        if (!campaign.getCode().equals(request.getCode()) && campaignRepository.existsByCode(request.getCode())) {
            throw new ConflictException("ERR-CAMP-001", "Mã chiến dịch đã tồn tại: " + request.getCode());
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("ERR-CAMP-002", "Ngày kết thúc phải sau ngày bắt đầu.");
        }

        promotionMapper.updateEntity(campaign, request);
        Campaign saved = campaignRepository.save(campaign);
        log.info("[CAMPAIGN UPDATED] id={}", saved.getId());
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("[CAMPAIGN DELETE] id={}", id);
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
        campaign.setStatus(Campaign.CampaignStatus.INACTIVE);
        campaignRepository.save(campaign);
        log.info("[CAMPAIGN DELETED] status set to INACTIVE for id={}", id);
    }

    @Override
    @Transactional
    public CampaignResponseDto activate(Long id) {
        log.info("[CAMPAIGN ACTIVATE] id={}", id);
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
        campaign.setStatus(Campaign.CampaignStatus.ACTIVE);
        Campaign saved = campaignRepository.save(campaign);
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CampaignResponseDto deactivate(Long id) {
        log.info("[CAMPAIGN DEACTIVATE] id={}", id);
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign", id));
        campaign.setStatus(Campaign.CampaignStatus.INACTIVE);
        Campaign saved = campaignRepository.save(campaign);
        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaignStatisticsDto getStatistics() {
        List<Campaign> campaigns = campaignRepository.findAll();
        long total = campaigns.size();
        long active = campaigns.stream().filter(c -> c.getStatus() == Campaign.CampaignStatus.ACTIVE).count();
        BigDecimal budget = campaigns.stream()
                .map(c -> c.getBudget() != null ? c.getBudget() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long usages = couponUsageRepository.count();
        // Sum coupon discounts
        BigDecimal discounts = couponUsageRepository.findAll().stream()
                .map(cu -> cu.getCoupon().getDiscountAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CampaignStatisticsDto.builder()
                .totalCampaigns(total)
                .activeCampaigns(active)
                .totalBudget(budget)
                .totalCouponUsages(usages)
                .totalCouponDiscounts(discounts)
                .build();
    }
}
