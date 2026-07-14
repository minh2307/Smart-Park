package com.smartpark.domain.notification.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.entity.PushHistory;
import com.smartpark.domain.notification.repository.PushHistoryRepository;
import com.smartpark.domain.notification.service.impl.PushServiceImpl;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PushServiceTest {

    @Mock
    private PushHistoryRepository pushHistoryRepository;

    @InjectMocks
    private PushServiceImpl pushService;

    private PushHistory testHistory;

    @BeforeEach
    void setUp() {
        testHistory = PushHistory.builder()
                .id(1L)
                .deviceToken("some-long-fcm-device-token-12345")
                .title("Welcome")
                .message("Hello User")
                .sendStatus(PushHistory.SendStatus.SENT)
                .build();
    }

    @Test
    void sendPush_ShouldSucceed_WhenDeviceTokenIsValid() {
        PushDto.SendRequest request = PushDto.SendRequest.builder()
                .deviceToken("some-long-fcm-device-token-12345")
                .title("Welcome")
                .message("Hello User")
                .build();

        when(pushHistoryRepository.save(any(PushHistory.class))).thenAnswer(i -> i.getArgument(0));

        PushDto.Response response = pushService.sendPush(request);

        assertNotNull(response);
        assertEquals(PushHistory.SendStatus.SENT, response.getSendStatus());
        verify(pushHistoryRepository, times(2)).save(any(PushHistory.class));
    }

    @Test
    void sendPush_ShouldThrowBusinessException_WhenDeviceTokenIsTooShort() {
        PushDto.SendRequest request = PushDto.SendRequest.builder()
                .deviceToken("short")
                .title("Welcome")
                .message("Hello User")
                .build();

        when(pushHistoryRepository.save(any(PushHistory.class))).thenAnswer(i -> i.getArgument(0));

        assertThrows(BusinessException.class, () -> pushService.sendPush(request));
        verify(pushHistoryRepository, times(2)).save(any(PushHistory.class));
    }

    @Test
    void sendPushBulk_ShouldSendValidAndSkipInvalid() {
        PushDto.BulkSendRequest request = PushDto.BulkSendRequest.builder()
                .deviceTokens(List.of("token-1234567890", "short", "token-0987654321"))
                .title("Bulk Push")
                .message("Body")
                .build();

        when(pushHistoryRepository.save(any(PushHistory.class))).thenAnswer(i -> i.getArgument(0));

        pushService.sendPushBulk(request);

        // Saves:
        // 1st token: pending + sent (2)
        // 2nd token: pending + failed (2)
        // 3rd token: pending + sent (2)
        // Total = 6
        verify(pushHistoryRepository, times(6)).save(any(PushHistory.class));
    }

    @Test
    void findAllHistory_ShouldReturnPageOfHistory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<PushHistory> page = new PageImpl<>(List.of(testHistory), pageable, 1);

        when(pushHistoryRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<PushDto.Response> result = pushService.findAllHistory("deviceToken", "SENT", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("some-long-fcm-device-token-12345", result.getContent().get(0).getDeviceToken());
    }

    @Test
    void findHistoryById_ShouldReturnHistory_WhenExists() {
        when(pushHistoryRepository.findById(1L)).thenReturn(Optional.of(testHistory));

        PushDto.Response result = pushService.findHistoryById(1L);

        assertNotNull(result);
        assertEquals("some-long-fcm-device-token-12345", result.getDeviceToken());
    }

    @Test
    void findHistoryById_ShouldThrowException_WhenNotFound() {
        when(pushHistoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pushService.findHistoryById(999L));
    }
}
