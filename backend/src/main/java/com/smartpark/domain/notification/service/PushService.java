package com.smartpark.domain.notification.service;

import com.smartpark.domain.notification.dto.PushDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PushService {

    PushDto.Response sendPush(PushDto.SendRequest request);

    void sendPushBulk(PushDto.BulkSendRequest request);

    Page<PushDto.Response> findAllHistory(
            String deviceToken,
            String status,
            Pageable pageable
    );

    PushDto.Response findHistoryById(Long id);
}
