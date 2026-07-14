package com.smartpark.domain.notification.mapper;

import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.entity.SmsHistory;

public class SmsMapper {

    public static SmsDto.Response toResponse(SmsHistory history) {
        if (history == null) return null;
        return SmsDto.Response.builder()
                .id(history.getId())
                .phoneNumber(history.getPhoneNumber())
                .message(history.getMessage())
                .deliveryStatus(history.getDeliveryStatus())
                .sentAt(history.getSentAt())
                .errorMessage(history.getErrorMessage())
                .build();
    }
}
