package com.smartpark.domain.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.notification.dto.NotificationDto;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.service.NotificationService;
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

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class NotificationControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAll_ShouldReturnPage() throws Exception {
        NotificationDto.Response response = NotificationDto.Response.builder()
                .id(1L)
                .title("Promo")
                .content("Free parking today")
                .build();

        when(notificationService.findAll(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/notifications")
                .param("search", "Promo")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].title").value("Promo"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findById_ShouldReturnNotification() throws Exception {
        NotificationDto.Response response = NotificationDto.Response.builder()
                .id(1L)
                .title("Promo")
                .build();

        when(notificationService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/notifications/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Promo"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_ShouldReturnCreatedNotification() throws Exception {
        NotificationDto.CreateRequest request = NotificationDto.CreateRequest.builder()
                .title("Title")
                .content("Content")
                .type(Notification.NotificationType.IN_APP)
                .userIds(List.of(1L))
                .build();

        NotificationDto.Response response = NotificationDto.Response.builder()
                .id(1L)
                .title("Title")
                .build();

        when(notificationService.create(any(NotificationDto.CreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Title"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_ShouldReturnUpdatedNotification() throws Exception {
        NotificationDto.UpdateRequest request = NotificationDto.UpdateRequest.builder()
                .title("New Title")
                .content("New Content")
                .priority(Notification.NotificationPriority.HIGH)
                .build();

        NotificationDto.Response response = NotificationDto.Response.builder()
                .id(1L)
                .title("New Title")
                .build();

        when(notificationService.update(eq(1L), any(NotificationDto.UpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/notifications/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("New Title"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(notificationService).delete(1L);

        mockMvc.perform(delete("/api/v1/notifications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Thông báo đã được xóa thành công."));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void markAsRead_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(notificationService).markAsRead(1L);

        mockMvc.perform(patch("/api/v1/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Thông báo đã được đánh dấu là đã đọc."));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void markAsUnread_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(notificationService).markAsUnread(1L);

        mockMvc.perform(patch("/api/v1/notifications/1/unread"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Thông báo đã được đánh dấu là chưa đọc."));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void markAllAsRead_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(notificationService).markAllAsRead();

        mockMvc.perform(patch("/api/v1/notifications/read-all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Tất cả thông báo đã được đánh dấu là đã đọc."));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getUnreadCount_ShouldReturnCount() throws Exception {
        when(notificationService.getUnreadCount()).thenReturn(5L);

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(5));
    }
}
