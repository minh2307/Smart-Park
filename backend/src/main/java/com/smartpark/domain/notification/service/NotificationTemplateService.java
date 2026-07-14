package com.smartpark.domain.notification.service;

import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationTemplateService {

    Page<NotificationTemplateDto.Response> findAll(
            String search,
            String channel,
            Boolean active,
            Pageable pageable
    );

    NotificationTemplateDto.Response findById(Long id);

    NotificationTemplateDto.Response findByTemplateCode(String templateCode);

    NotificationTemplateDto.Response create(NotificationTemplateDto.CreateRequest request);

    NotificationTemplateDto.Response update(Long id, NotificationTemplateDto.UpdateRequest request);

    void delete(Long id);

    NotificationTemplateDto.Response toggleActive(Long id);
}
