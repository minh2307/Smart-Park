package com.smartpark.domain.notification.mapper;

import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.entity.EmailHistory;

public class EmailMapper {

    public static EmailDto.Response toResponse(EmailHistory history) {
        if (history == null) return null;
        return EmailDto.Response.builder()
                .id(history.getId())
                .recipient(history.getRecipient())
                .subject(history.getSubject())
                .htmlContent(history.getHtmlContent())
                .attachmentPath(history.getAttachmentPath())
                .sendStatus(history.getSendStatus())
                .sentAt(history.getSentAt())
                .errorMessage(history.getErrorMessage())
                .retryCount(history.getRetryCount())
                .build();
    }
}
