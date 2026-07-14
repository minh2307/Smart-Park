package com.smartpark.domain.notification.service;

import com.smartpark.domain.notification.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface NotificationService {

    Page<NotificationDto.Response> findAll(
            String search,
            String type,
            String priority,
            String status,
            Long userId,
            Long customerId,
            Long employeeId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable
    );

    NotificationDto.Response findById(Long id);

    NotificationDto.Response create(NotificationDto.CreateRequest request);

    NotificationDto.Response update(Long id, NotificationDto.UpdateRequest request);

    void delete(Long id);

    void markAsRead(Long id);

    void markAsUnread(Long id);

    void markAllAsRead();

    long getUnreadCount();
}
