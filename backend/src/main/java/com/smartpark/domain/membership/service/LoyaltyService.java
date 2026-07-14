package com.smartpark.domain.membership.service;

import com.smartpark.domain.membership.dto.LoyaltyDto;
import com.smartpark.domain.membership.entity.PointHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LoyaltyService {

    Page<LoyaltyDto.AccountResponse> getAllAccounts(String search, Pageable pageable);

    LoyaltyDto.AccountResponse getAccountByCustomerId(Long customerId);

    Page<LoyaltyDto.TransactionResponse> getHistory(String search, PointHistory.TransactionType type, Long membershipId, Pageable pageable);

    LoyaltyDto.TransactionResponse earnPoints(LoyaltyDto.EarnRequest request);

    LoyaltyDto.TransactionResponse redeemPoints(LoyaltyDto.RedeemRequest request);

    LoyaltyDto.TransactionResponse adjustPoints(LoyaltyDto.AdjustRequest request);
}
