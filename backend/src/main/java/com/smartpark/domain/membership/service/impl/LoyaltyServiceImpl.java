package com.smartpark.domain.membership.service.impl;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.customer.entity.Customer;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.dto.LoyaltyDto;
import com.smartpark.domain.membership.entity.LoyaltyAccount;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.entity.PointHistory;
import com.smartpark.domain.membership.repository.LoyaltyAccountRepository;
import com.smartpark.domain.membership.repository.MembershipRepository;
import com.smartpark.domain.membership.repository.PointHistoryRepository;
import com.smartpark.domain.membership.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyAccountRepository accountRepository;
    private final MembershipRepository membershipRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final CustomerRepository customerRepository;

    private LoyaltyDto.AccountResponse toAccountResponse(LoyaltyAccount acc) {
        return LoyaltyDto.AccountResponse.builder()
                .id(acc.getId())
                .customerId(acc.getCustomer().getId())
                .customerName(acc.getCustomer().getFullName())
                .membershipId(acc.getMembership() != null ? acc.getMembership().getId() : null)
                .membershipCode(acc.getMembership() != null ? acc.getMembership().getMembershipCode() : null)
                .tierName(acc.getMembership() != null && acc.getMembership().getTier() != null ? acc.getMembership().getTier().getName() : "NONE")
                .currentPoints(acc.getCurrentPoints())
                .totalEarned(acc.getTotalEarned())
                .totalRedeemed(acc.getTotalRedeemed())
                .totalExpired(acc.getTotalExpired())
                .totalAdjusted(acc.getTotalAdjusted())
                .createdAt(acc.getCreatedAt())
                .updatedAt(acc.getUpdatedAt())
                .build();
    }

    private LoyaltyDto.TransactionResponse toTransactionResponse(PointHistory ph) {
        return LoyaltyDto.TransactionResponse.builder()
                .id(ph.getId())
                .membershipId(ph.getMembership().getId())
                .membershipCode(ph.getMembership().getMembershipCode())
                .customerId(ph.getMembership().getCustomer().getId())
                .customerName(ph.getMembership().getCustomer().getFullName())
                .orderId(ph.getOrderId())
                .pointsEarned(ph.getPointsEarned())
                .pointsRedeemed(ph.getPointsRedeemed())
                .transactionType(ph.getTransactionType())
                .balanceBefore(ph.getBalanceBefore())
                .balanceAfter(ph.getBalanceAfter())
                .referenceType(ph.getReferenceType())
                .reason(ph.getReason())
                .performedBy(ph.getPerformedBy())
                .createdAt(ph.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoyaltyDto.AccountResponse> getAllAccounts(String search, Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return accountRepository.findAllWithSearch(searchVal, pageable).map(this::toAccountResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public LoyaltyDto.AccountResponse getAccountByCustomerId(Long customerId) {
        LoyaltyAccount acc = accountRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("LoyaltyAccount for customer", customerId));
        return toAccountResponse(acc);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LoyaltyDto.TransactionResponse> getHistory(String search, PointHistory.TransactionType type, Long membershipId, Pageable pageable) {
        String searchVal = (search == null || search.isBlank()) ? null : search.trim();
        return pointHistoryRepository.findAllWithFilters(searchVal, type, membershipId, pageable)
                .map(this::toTransactionResponse);
    }

    @Override
    @Transactional
    public LoyaltyDto.TransactionResponse earnPoints(LoyaltyDto.EarnRequest request) {
        Membership membership = membershipRepository.findByCustomerIdAndStatus(request.getCustomerId(), Membership.MembershipStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("ERR-LOYALTY-001", "Khách hàng không có Membership ở trạng thái ACTIVE để tích điểm."));

        LoyaltyAccount acc = getOrCreateAccount(membership.getCustomer(), membership);

        // calculate points: (Spent Amount / 10000) * pointsMultiplier
        BigDecimal spent = request.getAmountPaid();
        long basePoints = spent.divide(BigDecimal.valueOf(10000)).longValue();
        long pointsEarned = basePoints;

        if (membership.getTier() != null && membership.getTier().getPointsMultiplier() != null) {
            pointsEarned = (long) (basePoints * membership.getTier().getPointsMultiplier().doubleValue());
        }

        if (pointsEarned <= 0) {
            throw new BusinessException("ERR-LOYALTY-002", "Số tiền chi tiêu không đủ để tích lũy tối thiểu 1 điểm.");
        }

        long before = acc.getCurrentPoints();
        long after = before + pointsEarned;

        acc.setCurrentPoints(after);
        acc.setTotalEarned(acc.getTotalEarned() + pointsEarned);
        acc.setMembership(membership);
        accountRepository.save(acc);

        // Sync points to membership entity (backward compatibility)
        membership.setPoints(after);
        // Update membership spending
        membership.setCurrentSpending(membership.getCurrentSpending().add(spent));
        membership.setLifetimeSpending(membership.getLifetimeSpending().add(spent));
        membershipRepository.save(membership);

        PointHistory ph = PointHistory.builder()
                .membership(membership)
                .orderId(request.getOrderId())
                .pointsEarned(pointsEarned)
                .pointsRedeemed(0L)
                .reason(request.getReason() != null ? request.getReason() : "Tích điểm tự động từ đơn hàng #" + request.getOrderId())
                .transactionType(PointHistory.TransactionType.EARN)
                .balanceBefore(before)
                .balanceAfter(after)
                .referenceType("ORDER")
                .build();

        PointHistory savedPh = pointHistoryRepository.save(ph);
        log.info("[POINTS EARNED] Customer ID={}, Points={}, Order ID={}", request.getCustomerId(), pointsEarned, request.getOrderId());
        return toTransactionResponse(savedPh);
    }

    @Override
    @Transactional
    public LoyaltyDto.TransactionResponse redeemPoints(LoyaltyDto.RedeemRequest request) {
        Membership membership = membershipRepository.findByCustomerIdAndStatus(request.getCustomerId(), Membership.MembershipStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("ERR-LOYALTY-001", "Khách hàng không có Membership ở trạng thái ACTIVE để đổi điểm."));

        LoyaltyAccount acc = getOrCreateAccount(membership.getCustomer(), membership);

        long redeemAmount = request.getPoints();
        if (acc.getCurrentPoints() < redeemAmount) {
            throw new BusinessException("ERR-LOYALTY-003", "Số dư điểm thưởng không đủ. Hiện có: " + acc.getCurrentPoints() + ", yêu cầu đổi: " + redeemAmount);
        }

        long before = acc.getCurrentPoints();
        long after = before - redeemAmount;

        acc.setCurrentPoints(after);
        acc.setTotalRedeemed(acc.getTotalRedeemed() + redeemAmount);
        accountRepository.save(acc);

        // Sync points
        membership.setPoints(after);
        membershipRepository.save(membership);

        PointHistory ph = PointHistory.builder()
                .membership(membership)
                .orderId(request.getOrderId())
                .pointsEarned(0L)
                .pointsRedeemed(redeemAmount)
                .reason(request.getReason() != null ? request.getReason() : "Đổi điểm thưởng sử dụng dịch vụ")
                .transactionType(PointHistory.TransactionType.REDEEM)
                .balanceBefore(before)
                .balanceAfter(after)
                .referenceType(request.getOrderId() != null ? "ORDER" : "MANUAL")
                .build();

        PointHistory savedPh = pointHistoryRepository.save(ph);
        log.info("[POINTS REDEEMED] Customer ID={}, Points={}, Order ID={}", request.getCustomerId(), redeemAmount, request.getOrderId());
        return toTransactionResponse(savedPh);
    }

    @Override
    @Transactional
    public LoyaltyDto.TransactionResponse adjustPoints(LoyaltyDto.AdjustRequest request) {
        Membership membership = membershipRepository.findByCustomerIdAndStatus(request.getCustomerId(), Membership.MembershipStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("ERR-LOYALTY-001", "Khách hàng không có Membership ở trạng thái ACTIVE để điều chỉnh điểm."));

        LoyaltyAccount acc = getOrCreateAccount(membership.getCustomer(), membership);

        long adjustAmount = request.getPoints();
        long before = acc.getCurrentPoints();
        long after = before + adjustAmount;

        if (after < 0) {
            throw new BusinessException("ERR-LOYALTY-004", "Điều chỉnh điểm thất bại: số dư điểm thưởng không thể âm. Hiện có: " + before + ", yêu cầu trừ: " + Math.abs(adjustAmount));
        }

        acc.setCurrentPoints(after);
        acc.setTotalAdjusted(acc.getTotalAdjusted() + adjustAmount);
        accountRepository.save(acc);

        // Sync points
        membership.setPoints(after);
        membershipRepository.save(membership);

        String creator = request.getPerformedBy() != null ? request.getPerformedBy() : SecurityContextHolder.getContext().getAuthentication().getName();

        PointHistory ph = PointHistory.builder()
                .membership(membership)
                .pointsEarned(adjustAmount > 0 ? adjustAmount : 0L)
                .pointsRedeemed(adjustAmount < 0 ? -adjustAmount : 0L)
                .reason(request.getReason())
                .transactionType(PointHistory.TransactionType.ADJUST)
                .balanceBefore(before)
                .balanceAfter(after)
                .referenceType("MANUAL")
                .performedBy(creator)
                .build();

        PointHistory savedPh = pointHistoryRepository.save(ph);
        log.info("[POINTS ADJUSTED] Customer ID={}, Change={}, New Balance={}, Performed By={}", request.getCustomerId(), adjustAmount, after, creator);
        return toTransactionResponse(savedPh);
    }

    private LoyaltyAccount getOrCreateAccount(Customer customer, Membership membership) {
        return accountRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> {
                    LoyaltyAccount account = LoyaltyAccount.builder()
                            .customer(customer)
                            .membership(membership)
                            .currentPoints(0L)
                            .totalEarned(0L)
                            .totalRedeemed(0L)
                            .totalExpired(0L)
                            .totalAdjusted(0L)
                            .build();
                    return accountRepository.save(account);
                });
    }
}
