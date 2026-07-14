package com.smartpark.domain.promotion.service;

import com.smartpark.domain.promotion.dto.CampaignRequestDto;
import com.smartpark.domain.promotion.dto.CampaignResponseDto;
import com.smartpark.domain.promotion.dto.CampaignStatisticsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface CampaignService {
    Page<CampaignResponseDto> findAll(String search, String campaignType, String status, LocalDate startDate, LocalDate endDate, Pageable pageable);
    CampaignResponseDto findById(Long id);
    CampaignResponseDto create(CampaignRequestDto request);
    CampaignResponseDto update(Long id, CampaignRequestDto request);
    void delete(Long id);
    CampaignResponseDto activate(Long id);
    CampaignResponseDto deactivate(Long id);
    CampaignStatisticsDto getStatistics();
}
