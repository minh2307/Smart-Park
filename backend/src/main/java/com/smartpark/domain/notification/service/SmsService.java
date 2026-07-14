package com.smartpark.domain.notification.service;

import com.smartpark.domain.notification.dto.SmsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SmsService {

    SmsDto.Response sendSms(SmsDto.SendRequest request);

    void sendSmsBulk(SmsDto.BulkSendRequest request);

    Page<SmsDto.Response> findAllHistory(
            String phoneNumber,
            String status,
            Pageable pageable
    );

    SmsDto.Response findHistoryById(Long id);
}
