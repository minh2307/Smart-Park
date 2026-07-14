package com.smartpark.domain.notification.service;

import com.smartpark.common.exception.BusinessException;
import com.smartpark.common.exception.ResourceNotFoundException;
import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.entity.SmsHistory;
import com.smartpark.domain.notification.repository.SmsHistoryRepository;
import com.smartpark.domain.notification.service.impl.SmsServiceImpl;
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
class SmsServiceTest {

    @Mock
    private SmsHistoryRepository smsHistoryRepository;

    @InjectMocks
    private SmsServiceImpl smsService;

    private SmsHistory testHistory;

    @BeforeEach
    void setUp() {
        testHistory = SmsHistory.builder()
                .id(1L)
                .phoneNumber("0912345678")
                .message("Test SMS Message")
                .deliveryStatus(SmsHistory.DeliveryStatus.SENT)
                .build();
    }

    @Test
    void sendSms_ShouldSucceed_WhenPhoneNumberIsValid() {
        SmsDto.SendRequest request = SmsDto.SendRequest.builder()
                .phoneNumber("0912345678")
                .message("Hello")
                .build();

        when(smsHistoryRepository.save(any(SmsHistory.class))).thenAnswer(i -> i.getArgument(0));

        SmsDto.Response response = smsService.sendSms(request);

        assertNotNull(response);
        assertEquals(SmsHistory.DeliveryStatus.SENT, response.getDeliveryStatus());
        verify(smsHistoryRepository, times(2)).save(any(SmsHistory.class));
    }

    @Test
    void sendSms_ShouldSucceed_WhenPhoneNumberIsValidWithCountryCode() {
        SmsDto.SendRequest request = SmsDto.SendRequest.builder()
                .phoneNumber("+84987654321")
                .message("Hello with country code")
                .build();

        when(smsHistoryRepository.save(any(SmsHistory.class))).thenAnswer(i -> i.getArgument(0));

        SmsDto.Response response = smsService.sendSms(request);

        assertNotNull(response);
        assertEquals(SmsHistory.DeliveryStatus.SENT, response.getDeliveryStatus());
    }

    @Test
    void sendSms_ShouldThrowBusinessException_WhenPhoneNumberIsInvalid() {
        SmsDto.SendRequest request = SmsDto.SendRequest.builder()
                .phoneNumber("123456789")
                .message("Hello invalid")
                .build();

        when(smsHistoryRepository.save(any(SmsHistory.class))).thenAnswer(i -> i.getArgument(0));

        assertThrows(BusinessException.class, () -> smsService.sendSms(request));
        verify(smsHistoryRepository, times(2)).save(any(SmsHistory.class));
    }

    @Test
    void sendSmsBulk_ShouldSendValidAndSkipInvalid() {
        SmsDto.BulkSendRequest request = SmsDto.BulkSendRequest.builder()
                .phoneNumbers(List.of("0912345678", "invalid-phone", "+84333444555"))
                .message("Bulk SMS")
                .build();

        when(smsHistoryRepository.save(any(SmsHistory.class))).thenAnswer(i -> i.getArgument(0));

        smsService.sendSmsBulk(request);

        // Saved:
        // 1st number: pending + sent (2 saves)
        // 2nd number: pending + failed (2 saves)
        // 3rd number: pending + sent (2 saves)
        // Total saves = 6
        verify(smsHistoryRepository, times(6)).save(any(SmsHistory.class));
    }

    @Test
    void findAllHistory_ShouldReturnPageOfHistory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<SmsHistory> page = new PageImpl<>(List.of(testHistory), pageable, 1);

        when(smsHistoryRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        Page<SmsDto.Response> result = smsService.findAllHistory("0912", "SENT", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("0912345678", result.getContent().get(0).getPhoneNumber());
    }

    @Test
    void findHistoryById_ShouldReturnHistory_WhenExists() {
        when(smsHistoryRepository.findById(1L)).thenReturn(Optional.of(testHistory));

        SmsDto.Response result = smsService.findHistoryById(1L);

        assertNotNull(result);
        assertEquals("0912345678", result.getPhoneNumber());
    }

    @Test
    void findHistoryById_ShouldThrowException_WhenNotFound() {
        when(smsHistoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> smsService.findHistoryById(999L));
    }
}
