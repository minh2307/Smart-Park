package com.smartpark.domain.membership.service.impl;

import com.smartpark.common.exception.ConflictException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.membership.dto.MembershipTierDto;
import com.smartpark.domain.membership.entity.MembershipTier;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.service.MembershipTierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipTierServiceImpl implements MembershipTierService {

    private final MembershipTierRepository tierRepository;

    private MembershipTierDto.Response toResponse(MembershipTier tier) {
        return MembershipTierDto.Response.builder()
                .id(tier.getId())
                .code(tier.getCode())
                .name(tier.getName())
                .description(tier.getDescription())
                .minSpend(tier.getMinSpend())
                .discountPercentage(tier.getDiscountPercentage())
                .pointsMultiplier(tier.getPointsMultiplier())
                .priorityQueue(tier.getPriorityQueue())
                .freeParking(tier.getFreeParking())
                .birthdayBenefit(tier.getBirthdayBenefit())
                .loungeAccess(tier.getLoungeAccess())
                .sortOrder(tier.getSortOrder())
                .status(tier.getStatus())
                .createdAt(tier.getCreatedAt())
                .updatedAt(tier.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MembershipTierDto.Response> getAll(String search, MembershipTier.TierStatus status, Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return tierRepository.findAllActive(searchVal, status, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipTierDto.Response getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public MembershipTierDto.Response create(MembershipTierDto.CreateRequest request) {
        String code = request.getCode().toUpperCase().trim();
        tierRepository.findByCode(code).ifPresent(existing -> {
            if (existing.getDeletedAt() == null) {
                throw new ConflictException("ERR-TIER-001", "Mã hạng thẻ '" + code + "' đã tồn tại.");
            } else {
                // Reactivate soft-deleted one
                existing.setDeletedAt(null);
                existing.setStatus(MembershipTier.TierStatus.ACTIVE);
            }
        });

        MembershipTier tier = MembershipTier.builder()
                .code(code)
                .name(request.getName().trim())
                .description(request.getDescription())
                .minSpend(request.getMinSpend() != null ? request.getMinSpend() : BigDecimal.ZERO)
                .discountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO)
                .pointsMultiplier(request.getPointsMultiplier() != null ? request.getPointsMultiplier() : BigDecimal.ONE)
                .priorityQueue(request.getPriorityQueue() != null ? request.getPriorityQueue() : false)
                .freeParking(request.getFreeParking() != null ? request.getFreeParking() : false)
                .birthdayBenefit(request.getBirthdayBenefit())
                .loungeAccess(request.getLoungeAccess() != null ? request.getLoungeAccess() : false)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .status(MembershipTier.TierStatus.ACTIVE)
                .build();

        MembershipTier saved = tierRepository.save(tier);
        log.info("[MEMBERSHIP TIER CREATED] id={} code={}", saved.getId(), saved.getCode());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MembershipTierDto.Response update(Long id, MembershipTierDto.UpdateRequest request) {
        MembershipTier tier = findOrThrow(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            tier.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            tier.setDescription(request.getDescription());
        }
        if (request.getMinSpend() != null) {
            tier.setMinSpend(request.getMinSpend());
        }
        if (request.getDiscountPercentage() != null) {
            tier.setDiscountPercentage(request.getDiscountPercentage());
        }
        if (request.getPointsMultiplier() != null) {
            tier.setPointsMultiplier(request.getPointsMultiplier());
        }
        if (request.getPriorityQueue() != null) {
            tier.setPriorityQueue(request.getPriorityQueue());
        }
        if (request.getFreeParking() != null) {
            tier.setFreeParking(request.getFreeParking());
        }
        if (request.getBirthdayBenefit() != null) {
            tier.setBirthdayBenefit(request.getBirthdayBenefit());
        }
        if (request.getLoungeAccess() != null) {
            tier.setLoungeAccess(request.getLoungeAccess());
        }
        if (request.getSortOrder() != null) {
            tier.setSortOrder(request.getSortOrder());
        }

        MembershipTier saved = tierRepository.save(tier);
        log.info("[MEMBERSHIP TIER UPDATED] id={} code={}", saved.getId(), saved.getCode());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        MembershipTier tier = findOrThrow(id);
        tier.setDeletedAt(LocalDateTime.now());
        tier.setStatus(MembershipTier.TierStatus.INACTIVE);
        tierRepository.save(tier);
        log.info("[MEMBERSHIP TIER DELETED] id={} code={}", id, tier.getCode());
    }

    @Override
    @Transactional
    public MembershipTierDto.Response updateStatus(Long id, MembershipTierDto.StatusRequest request) {
        MembershipTier tier = findOrThrow(id);
        tier.setStatus(request.getStatus());
        MembershipTier saved = tierRepository.save(tier);
        log.info("[MEMBERSHIP TIER STATUS UPDATED] id={} code={} status={}", id, tier.getCode(), request.getStatus());
        return toResponse(saved);
    }

    private MembershipTier findOrThrow(Long id) {
        return tierRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipTier", id));
    }
}
