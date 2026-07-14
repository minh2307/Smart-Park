package com.smartpark.domain.membership.service;

import com.smartpark.domain.membership.dto.MembershipDto;
import com.smartpark.domain.membership.entity.Membership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface MembershipManagementService {

    Page<MembershipDto.Response> getAll(
            String search,
            Membership.MembershipStatus status,
            Long tierId,
            LocalDate expiryFrom,
            LocalDate expiryTo,
            Pageable pageable);

    MembershipDto.Response getById(Long id);

    MembershipDto.Response create(MembershipDto.CreateRequest request);

    MembershipDto.Response update(Long id, MembershipDto.UpdateRequest request);

    void delete(Long id);

    MembershipDto.Response upgrade(Long id, MembershipDto.UpgradeRequest request);

    MembershipDto.Response renew(Long id, MembershipDto.RenewRequest request);

    MembershipDto.Response cancel(Long id, MembershipDto.CancelRequest request);
}
