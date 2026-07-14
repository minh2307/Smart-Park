package com.smartpark.domain.membership.service.impl;

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
import com.smartpark.domain.membership.service.MembershipManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipManagementServiceImpl implements MembershipManagementService {

    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository tierRepository;
    private final CustomerRepository customerRepository;

    private MembershipDto.Response toResponse(Membership m) {
        return MembershipDto.Response.builder()
                .id(m.getId())
                .membershipCode(m.getMembershipCode())
                .customerId(m.getCustomer().getId())
                .customerName(m.getCustomer().getFullName())
                .tierId(m.getTier().getId())
                .tierName(m.getTier().getName())
                .tierCode(m.getTier().getCode())
                .joinDate(m.getJoinDate())
                .startDate(m.getStartDate())
                .expirationDate(m.getExpirationDate())
                .autoRenewal(m.getAutoRenewal())
                .points(m.getPoints())
                .currentSpending(m.getCurrentSpending())
                .lifetimeSpending(m.getLifetimeSpending())
                .renewalCount(m.getRenewalCount())
                .status(m.getStatus())
                .cancelledAt(m.getCancelledAt())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MembershipDto.Response> getAll(
            String search,
            Membership.MembershipStatus status,
            Long tierId,
            LocalDate expiryFrom,
            LocalDate expiryTo,
            Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return membershipRepository.findAllWithFilters(searchVal, status, tierId, expiryFrom, expiryTo, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipDto.Response getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public MembershipDto.Response create(MembershipDto.CreateRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        // Business Rule: One customer has only one active membership
        membershipRepository.findByCustomerIdAndStatus(customer.getId(), Membership.MembershipStatus.ACTIVE)
                .ifPresent(existing -> {
                    throw new ConflictException("ERR-MEM-001", "Khách hàng đã có một thẻ thành viên đang hoạt động (Code: " + existing.getMembershipCode() + ").");
                });

        MembershipTier tier = tierRepository.findByIdAndNotDeleted(request.getTierId())
                .orElseThrow(() -> new ResourceNotFoundException("MembershipTier", request.getTierId()));

        String membershipCode = "MEM-" + String.format("%08d", customer.getId()) + "-" + System.currentTimeMillis() % 10000;

        Membership membership = Membership.builder()
                .customer(customer)
                .tier(tier)
                .membershipCode(membershipCode)
                .joinDate(LocalDate.now())
                .startDate(request.getStartDate())
                .expirationDate(request.getExpirationDate() != null ? request.getExpirationDate() : request.getStartDate().plusYears(1))
                .autoRenewal(request.getAutoRenewal() != null ? request.getAutoRenewal() : false)
                .points(0L)
                .currentSpending(BigDecimal.ZERO)
                .lifetimeSpending(BigDecimal.ZERO)
                .renewalCount(0)
                .status(Membership.MembershipStatus.ACTIVE)
                .build();

        Membership saved = membershipRepository.save(membership);
        log.info("[MEMBERSHIP CREATED] id={} code={} customer={}", saved.getId(), saved.getMembershipCode(), customer.getFullName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MembershipDto.Response update(Long id, MembershipDto.UpdateRequest request) {
        Membership m = findOrThrow(id);

        if (request.getTierId() != null) {
            MembershipTier tier = tierRepository.findByIdAndNotDeleted(request.getTierId())
                    .orElseThrow(() -> new ResourceNotFoundException("MembershipTier", request.getTierId()));
            m.setTier(tier);
        }
        if (request.getExpirationDate() != null) {
            m.setExpirationDate(request.getExpirationDate());
        }
        if (request.getAutoRenewal() != null) {
            m.setAutoRenewal(request.getAutoRenewal());
        }
        if (request.getStatus() != null) {
            m.setStatus(request.getStatus());
        }

        Membership saved = membershipRepository.save(m);
        log.info("[MEMBERSHIP UPDATED] id={} code={}", saved.getId(), saved.getMembershipCode());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Membership m = findOrThrow(id);
        m.setStatus(Membership.MembershipStatus.CANCELLED);
        m.setCancelledAt(LocalDateTime.now());
        membershipRepository.save(m);
        log.info("[MEMBERSHIP DELETED/CANCELLED] id={} code={}", id, m.getMembershipCode());
    }

    @Override
    @Transactional
    public MembershipDto.Response upgrade(Long id, MembershipDto.UpgradeRequest request) {
        Membership m = findOrThrow(id);

        MembershipTier newTier = tierRepository.findByIdAndNotDeleted(request.getNewTierId())
                .orElseThrow(() -> new ResourceNotFoundException("MembershipTier", request.getNewTierId()));

        // Business Rule: Upgrade only to higher tier (compare sortOrder)
        if (newTier.getSortOrder() <= m.getTier().getSortOrder()) {
            throw new BusinessException("ERR-MEM-002", "Hạng thẻ mới (" + newTier.getName() + ") phải cao hơn hạng thẻ hiện tại (" + m.getTier().getName() + ").");
        }

        m.setTier(newTier);
        Membership saved = membershipRepository.save(m);
        log.info("[MEMBERSHIP UPGRADED] id={} code={} oldTier={} newTier={}", id, m.getMembershipCode(), m.getTier().getName(), newTier.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MembershipDto.Response renew(Long id, MembershipDto.RenewRequest request) {
        Membership m = findOrThrow(id);

        // Business Rule: Membership cannot be renewed if already expired beyond configurable grace period.
        // Let's assume a grace period of 30 days.
        LocalDate expiryDate = m.getExpirationDate();
        if (expiryDate != null && expiryDate.plusDays(30).isBefore(LocalDate.now())) {
            throw new BusinessException("ERR-MEM-003", "Thẻ đã hết hạn quá thời gian ân hạn (30 ngày). Vui lòng tạo thẻ mới.");
        }

        int monthsToAdd = request.getMonths() != null ? request.getMonths() : 12;
        LocalDate baseDate = (expiryDate != null && expiryDate.isAfter(LocalDate.now())) ? expiryDate : LocalDate.now();
        m.setExpirationDate(baseDate.plusMonths(monthsToAdd));
        m.setRenewalCount(m.getRenewalCount() + 1);
        m.setStatus(Membership.MembershipStatus.ACTIVE);
        m.setCurrentSpending(BigDecimal.ZERO); // reset current spending period

        Membership saved = membershipRepository.save(m);
        log.info("[MEMBERSHIP RENEWED] id={} code={} newExpiry={}", id, m.getMembershipCode(), m.getExpirationDate());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public MembershipDto.Response cancel(Long id, MembershipDto.CancelRequest request) {
        Membership m = findOrThrow(id);
        m.setStatus(Membership.MembershipStatus.CANCELLED);
        m.setCancelledAt(LocalDateTime.now());
        Membership saved = membershipRepository.save(m);
        log.info("[MEMBERSHIP CANCELLED] id={} code={}", id, m.getMembershipCode());
        return toResponse(saved);
    }

    private Membership findOrThrow(Long id) {
        return membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership", id));
    }
}
