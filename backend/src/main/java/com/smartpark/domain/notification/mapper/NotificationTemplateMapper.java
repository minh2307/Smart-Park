package com.smartpark.domain.notification.mapper;

import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import com.smartpark.domain.notification.entity.NotificationTemplate;

public class NotificationTemplateMapper {

    public static NotificationTemplateDto.Response toResponse(NotificationTemplate template) {
        if (template == null) return null;
        return NotificationTemplateDto.Response.builder()
                .id(template.getId())
                .templateCode(template.getTemplateCode())
                .templateName(template.getTemplateName())
                .channel(template.getChannel())
                .subject(template.getSubject())
                .body(template.getBody())
                .variables(template.getVariables())
                .active(template.isActive())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .createdBy(template.getCreatedBy())
                .updatedBy(template.getUpdatedBy())
                .build();
    }
}
