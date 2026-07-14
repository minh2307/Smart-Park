package com.smartpark.domain.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.notification.dto.EmailDto;
import com.smartpark.domain.notification.entity.EmailHistory;
import com.smartpark.domain.notification.service.EmailService;
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

@WebMvcTest(EmailController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class EmailControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmailService emailService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendEmail_ShouldReturnSuccess() throws Exception {
        EmailDto.SendRequest request = EmailDto.SendRequest.builder()
                .recipient("test@smartpark.com")
                .subject("Welcome")
                .htmlContent("<p>Hi</p>")
                .build();

        EmailDto.Response response = EmailDto.Response.builder()
                .id(1L)
                .recipient("test@smartpark.com")
                .sendStatus(EmailHistory.SendStatus.SENT)
                .build();

        when(emailService.sendEmail(any(EmailDto.SendRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/email/send")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.recipient").value("test@smartpark.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void sendEmailBulk_ShouldReturnSuccess() throws Exception {
        EmailDto.BulkSendRequest request = EmailDto.BulkSendRequest.builder()
                .recipients(List.of("one@smartpark.com"))
                .subject("Hi")
                .htmlContent("Body")
                .build();

        doNothing().when(emailService).sendEmailBulk(any(EmailDto.BulkSendRequest.class));

        mockMvc.perform(post("/api/v1/email/send-bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Email hàng loạt đang được gửi."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAllHistory_ShouldReturnPage() throws Exception {
        EmailDto.Response response = EmailDto.Response.builder()
                .id(1L)
                .recipient("test@smartpark.com")
                .build();

        when(emailService.findAllHistory(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/email/history")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].recipient").value("test@smartpark.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findHistoryById_ShouldReturnHistory() throws Exception {
        EmailDto.Response response = EmailDto.Response.builder()
                .id(1L)
                .recipient("test@smartpark.com")
                .build();

        when(emailService.findHistoryById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/email/history/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.recipient").value("test@smartpark.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void retryFailedEmails_ShouldReturnSuccess() throws Exception {
        doNothing().when(emailService).retryFailedEmails();

        mockMvc.perform(post("/api/v1/email/retry"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Đang thực hiện gửi lại các email lỗi."));
    }
}
