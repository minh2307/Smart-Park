package com.smartpark.domain.notification.service;

import com.smartpark.domain.notification.dto.EmailDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmailService {

    EmailDto.Response sendEmail(EmailDto.SendRequest request);

    void sendEmailBulk(EmailDto.BulkSendRequest request);

    Page<EmailDto.Response> findAllHistory(
            String recipient,
            String status,
            Pageable pageable
    );

    EmailDto.Response findHistoryById(Long id);

    void retryFailedEmails();
}
