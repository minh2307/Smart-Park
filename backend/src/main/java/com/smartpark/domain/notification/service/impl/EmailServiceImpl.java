package com.smartpark.domain.notification.service.impl;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.entity.EmailHistory;
import com.smartpark.domain.notification.mapper.EmailMapper;
import com.smartpark.domain.notification.repository.EmailHistoryRepository;
import com.smartpark.domain.notification.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailHistoryRepository emailHistoryRepository;

    @Override
    @Transactional
    public EmailDto.Response sendEmail(EmailDto.SendRequest request) {
        EmailHistory history = EmailHistory.builder()
                .recipient(request.getRecipient())
                .subject(request.getSubject())
                .htmlContent(request.getHtmlContent())
                .attachmentPath(request.getAttachmentPath())
                .sendStatus(EmailHistory.SendStatus.PENDING)
                .build();
        emailHistoryRepository.save(history);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(request.getRecipient());
            helper.setSubject(request.getSubject());
            helper.setText(request.getHtmlContent(), true);

            if (request.getAttachmentPath() != null && !request.getAttachmentPath().isBlank()) {
                File file = new File(request.getAttachmentPath());
                if (file.exists()) {
                    helper.addAttachment(file.getName(), file);
                }
            }

            mailSender.send(message);
            history.setSendStatus(EmailHistory.SendStatus.SENT);
            history.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Failed to send email to {}", request.getRecipient(), e);
            history.setSendStatus(EmailHistory.SendStatus.FAILED);
            history.setErrorMessage(e.getMessage());
        }
        emailHistoryRepository.save(history);
        return EmailMapper.toResponse(history);
    }

    @Override
    @Transactional
    public void sendEmailBulk(EmailDto.BulkSendRequest request) {
        for (String recipient : request.getRecipients()) {
            sendEmail(EmailDto.SendRequest.builder()
                    .recipient(recipient)
                    .subject(request.getSubject())
                    .htmlContent(request.getHtmlContent())
                    .build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmailDto.Response> findAllHistory(String recipient, String status, Pageable pageable) {
        Specification<EmailHistory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (recipient != null && !recipient.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("recipient")), "%" + recipient.toLowerCase() + "%"));
            }
            if (status != null && !status.isBlank()) {
                try {
                    EmailHistory.SendStatus sendStatus = EmailHistory.SendStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("sendStatus"), sendStatus));
                } catch (IllegalArgumentException ignored) {}
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return emailHistoryRepository.findAll(spec, pageable).map(EmailMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EmailDto.Response findHistoryById(Long id) {
        EmailHistory history = emailHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailHistory", id));
        return EmailMapper.toResponse(history);
    }

    @Override
    @Transactional
    public void retryFailedEmails() {
        List<EmailHistory> failed = emailHistoryRepository.findBySendStatus(EmailHistory.SendStatus.FAILED);
        for (EmailHistory history : failed) {
            if (history.getRetryCount() < 3) {
                history.setRetryCount(history.getRetryCount() + 1);
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setTo(history.getRecipient());
                    helper.setSubject(history.getSubject());
                    helper.setText(history.getHtmlContent(), true);

                    if (history.getAttachmentPath() != null && !history.getAttachmentPath().isBlank()) {
                        File file = new File(history.getAttachmentPath());
                        if (file.exists()) {
                            helper.addAttachment(file.getName(), file);
                        }
                    }

                    mailSender.send(message);
                    history.setSendStatus(EmailHistory.SendStatus.SENT);
                    history.setSentAt(LocalDateTime.now());
                    history.setErrorMessage(null);
                } catch (Exception e) {
                    history.setErrorMessage(e.getMessage());
                }
                emailHistoryRepository.save(history);
            }
        }
    }
}
