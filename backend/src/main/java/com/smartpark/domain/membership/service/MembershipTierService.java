package com.smartpark.domain.membership.service;

import com.smartpark.domain.membership.dto.MembershipTierDto;
import com.smartpark.domain.membership.entity.MembershipTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MembershipTierService {

    Page<MembershipTierDto.Response> getAll(String search, MembershipTier.TierStatus status, Pageable pageable);

    MembershipTierDto.Response getById(Long id);

    MembershipTierDto.Response create(MembershipTierDto.CreateRequest request);

    MembershipTierDto.Response update(Long id, MembershipTierDto.UpdateRequest request);

    void delete(Long id);

    MembershipTierDto.Response updateStatus(Long id, MembershipTierDto.StatusRequest request);
}
