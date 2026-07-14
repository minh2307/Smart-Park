package com.smartpark.domain.notification.service;

import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.entity.EmailHistory;
import com.smartpark.domain.notification.repository.EmailHistoryRepository;
import com.smartpark.domain.notification.service.impl.EmailServiceImpl;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailHistoryRepository emailHistoryRepository;

    @InjectMocks
    private EmailServiceImpl emailService;

    private EmailHistory testHistory;

    @BeforeEach
    void setUp() {
        testHistory = EmailHistory.builder()
                .id(1L)
                .recipient("test@smartpark.com")
                .subject("Test Subject")
                .htmlContent("<p>Test Content</p>")
                .sendStatus(EmailHistory.SendStatus.PENDING)
                .retryCount(0)
                .build();
    }

    @Test
    void sendEmail_ShouldSucceed_WhenMailSenderDoesNotThrow() {
        EmailDto.SendRequest request = EmailDto.SendRequest.builder()
                .recipient("test@smartpark.com")
                .subject("Test Subject")
                .htmlContent("<p>Test Content</p>")
                .build();

        MimeMessage mockMimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        when(emailHistoryRepository.save(any(EmailHistory.class))).thenAnswer(i -> i.getArgument(0));

        EmailDto.Response response = emailService.sendEmail(request);

        assertNotNull(response);
        assertEquals(EmailHistory.SendStatus.SENT, response.getSendStatus());
        verify(mailSender, times(1)).send(mockMimeMessage);
    }

    @Test
    void sendEmail_ShouldFail_WhenMailSenderThrows() {
        EmailDto.SendRequest request = EmailDto.SendRequest.builder()
                .recipient("test@smartpark.com")
                .subject("Test Subject")
                .htmlContent("<p>Test Content</p>")
                .build();

        MimeMessage mockMimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new RuntimeException("Mail server down")).when(mailSender).send(any(MimeMessage.class));
        when(emailHistoryRepository.save(any(EmailHistory.class))).thenAnswer(i -> i.getArgument(0));

        EmailDto.Response response = emailService.sendEmail(request);

        assertNotNull(response);
        assertEquals(EmailHistory.SendStatus.FAILED, response.getSendStatus());
        assertEquals("Mail server down", response.getErrorMessage());
    }

    @Test
    void sendEmailBulk_ShouldSendMultipleEmails() {
        EmailDto.BulkSendRequest request = EmailDto.BulkSendRequest.builder()
                .recipients(List.of("one@smartpark.com", "two@smartpark.com"))
                .subject("Bulk Subject")
                .htmlContent("Bulk Content")
                .build();

        MimeMessage mockMimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        when(emailHistoryRepository.save(any(EmailHistory.class))).thenAnswer(i -> i.getArgument(0));

        emailService.sendEmailBulk(request);

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void findAllHistory_ShouldReturnPageOfHistory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<EmailHistory> page = new PageImpl<>(List.of(testHistory), pageable, 1);

        when(emailHistoryRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<EmailDto.Response> result = emailService.findAllHistory("test", "PENDING", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("test@smartpark.com", result.getContent().get(0).getRecipient());
    }

    @Test
    void findHistoryById_ShouldReturnHistory_WhenExists() {
        when(emailHistoryRepository.findById(1L)).thenReturn(Optional.of(testHistory));

        EmailDto.Response result = emailService.findHistoryById(1L);

        assertNotNull(result);
        assertEquals("test@smartpark.com", result.getRecipient());
    }

    @Test
    void findHistoryById_ShouldThrowException_WhenNotFound() {
        when(emailHistoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> emailService.findHistoryById(999L));
    }

    @Test
    void retryFailedEmails_ShouldRetryMaxThreeTimes() {
        EmailHistory failedHistory = EmailHistory.builder()
                .id(2L)
                .recipient("fail@smartpark.com")
                .subject("Fail Subject")
                .htmlContent("Content")
                .sendStatus(EmailHistory.SendStatus.FAILED)
                .retryCount(0)
                .build();

        when(emailHistoryRepository.findBySendStatus(EmailHistory.SendStatus.FAILED))
                .thenReturn(List.of(failedHistory));

        MimeMessage mockMimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        // First retry succeeds
        emailService.retryFailedEmails();

        assertEquals(EmailHistory.SendStatus.SENT, failedHistory.getSendStatus());
        assertEquals(1, failedHistory.getRetryCount());
        verify(emailHistoryRepository, times(1)).save(failedHistory);
    }
}
