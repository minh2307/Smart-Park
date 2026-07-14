package com.smartpark.domain.notification.mapper;

import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.entity.PushHistory;

public class PushMapper {

    public static PushDto.Response toResponse(PushHistory history) {
        if (history == null) return null;
        return PushDto.Response.builder()
                .id(history.getId())
                .deviceToken(history.getDeviceToken())
                .topic(history.getTopic())
                .title(history.getTitle())
                .message(history.getMessage())
                .imageUrl(history.getImageUrl())
                .sendStatus(history.getSendStatus())
                .sentAt(history.getSentAt())
                .errorMessage(history.getErrorMessage())
                .build();
    }
}
