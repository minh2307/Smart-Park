package com.smartpark.domain.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.notification.dto.PushDto;
import com.smartpark.domain.notification.entity.PushHistory;
import com.smartpark.domain.notification.service.PushService;
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

@WebMvcTest(PushController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PushControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PushService pushService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendPush_ShouldReturnSuccess() throws Exception {
        PushDto.SendRequest request = PushDto.SendRequest.builder()
                .deviceToken("some-long-device-token-12345")
                .topic("promos")
                .title("Promo today")
                .message("Free parking")
                .build();

        PushDto.Response response = PushDto.Response.builder()
                .id(1L)
                .deviceToken("some-long-device-token-12345")
                .sendStatus(PushHistory.SendStatus.SENT)
                .build();

        when(pushService.sendPush(any(PushDto.SendRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/push/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deviceToken").value("some-long-device-token-12345"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendPushBulk_ShouldReturnSuccess() throws Exception {
        PushDto.BulkSendRequest request = PushDto.BulkSendRequest.builder()
                .deviceTokens(List.of("some-long-device-token-12345"))
                .topic("promos")
                .title("Promo today")
                .message("Free parking")
                .build();

        doNothing().when(pushService).sendPushBulk(any(PushDto.BulkSendRequest.class));

        mockMvc.perform(post("/api/v1/push/send-bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Push notification hàng loạt đang được gửi."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAllHistory_ShouldReturnPage() throws Exception {
        PushDto.Response response = PushDto.Response.builder()
                .id(1L)
                .deviceToken("some-long-device-token-12345")
                .build();

        when(pushService.findAllHistory(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/push/history")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].deviceToken").value("some-long-device-token-12345"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findHistoryById_ShouldReturnHistory() throws Exception {
        PushDto.Response response = PushDto.Response.builder()
                .id(1L)
                .deviceToken("some-long-device-token-12345")
                .build();

        when(pushService.findHistoryById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/push/history/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.deviceToken").value("some-long-device-token-12345"));
    }
}
