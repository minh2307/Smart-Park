package com.smartpark.domain.notification.mapper;

import com.smartpark.domain.notification.dto.NotificationDto;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.entity.NotificationRecipient;

import java.util.List;
import java.util.stream.Collectors;

public class NotificationMapper {

    public static NotificationDto.Response toResponse(Notification notification, List<NotificationRecipient> recipients) {
        if (notification == null) return null;
        return NotificationDto.Response.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .priority(notification.getPriority())
                .status(notification.getStatus())
                .expirationTime(notification.getExpirationTime())
                .createdAt(notification.getCreatedAt())
                .createdBy(notification.getCreatedBy())
                .recipients(recipients != null ? recipients.stream()
                        .map(NotificationMapper::toRecipientResponse)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public static NotificationDto.RecipientResponse toRecipientResponse(NotificationRecipient recipient) {
        if (recipient == null) return null;
        return NotificationDto.RecipientResponse.builder()
                .id(recipient.getId())
                .userId(recipient.getUser() != null ? recipient.getUser().getId() : null)
                .username(recipient.getUser() != null ? recipient.getUser().getUsername() : null)
                .customerId(recipient.getCustomer() != null ? recipient.getCustomer().getId() : null)
                .customerName(recipient.getCustomer() != null ? recipient.getCustomer().getFullName() : null)
                .employeeId(recipient.getEmployee() != null ? recipient.getEmployee().getId() : null)
                .employeeName(recipient.getEmployee() != null ? recipient.getEmployee().getFullName() : null)
                .readStatus(recipient.getReadStatus())
                .readAt(recipient.getReadAt())
                .deliveryStatus(recipient.getDeliveryStatus())
                .deliveredAt(recipient.getDeliveredAt())
                .errorMessage(recipient.getErrorMessage())
                .build();
    }
}
