package com.smartpark.domain.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.notification.dto.SmsDto;
import com.smartpark.domain.notification.entity.SmsHistory;
import com.smartpark.domain.notification.service.SmsService;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import com.smartpark.security.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SmsController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SmsControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SmsService smsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendSms_ShouldReturnSuccess() throws Exception {
        SmsDto.SendRequest request = SmsDto.SendRequest.builder()
                .phoneNumber("0912345678")
                .message("Test message")
                .build();

        SmsDto.Response response = SmsDto.Response.builder()
                .id(1L)
                .phoneNumber("0912345678")
                .deliveryStatus(SmsHistory.DeliveryStatus.SENT)
                .build();

        when(smsService.sendSms(any(SmsDto.SendRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/sms/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phoneNumber").value("0912345678"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendSmsBulk_ShouldReturnSuccess() throws Exception {
        SmsDto.BulkSendRequest request = SmsDto.BulkSendRequest.builder()
                .phoneNumbers(List.of("0912345678"))
                .message("Bulk message")
                .build();

        doNothing().when(smsService).sendSmsBulk(any(SmsDto.BulkSendRequest.class));

        mockMvc.perform(post("/api/v1/sms/send-bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("SMS hàng loạt đang được gửi."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAllHistory_ShouldReturnPage() throws Exception {
        SmsDto.Response response = SmsDto.Response.builder()
                .id(1L)
                .phoneNumber("0912345678")
                .build();

        when(smsService.findAllHistory(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/sms/history")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].phoneNumber").value("0912345678"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findHistoryById_ShouldReturnHistory() throws Exception {
        SmsDto.Response response = SmsDto.Response.builder()
                .id(1L)
                .phoneNumber("0912345678")
                .build();

        when(smsService.findHistoryById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/sms/history/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phoneNumber").value("0912345678"));
    }
}
