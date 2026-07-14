package com.smartpark.domain.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.notification.dto.NotificationTemplateDto;
import com.smartpark.domain.notification.entity.Notification;
import com.smartpark.domain.notification.service.NotificationTemplateService;
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

@WebMvcTest(NotificationTemplateController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class NotificationTemplateControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationTemplateService templateService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void findAll_ShouldReturnPage() throws Exception {
        NotificationTemplateDto.Response response = NotificationTemplateDto.Response.builder()
                .id(1L)
                .templateCode("WELCOME")
                .templateName("Welcome Template")
                .build();

        when(templateService.findAll(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/notification-templates")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].templateCode").value("WELCOME"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void findById_ShouldReturnTemplate() throws Exception {
        NotificationTemplateDto.Response response = NotificationTemplateDto.Response.builder()
                .id(1L)
                .templateCode("WELCOME")
                .build();

        when(templateService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/notification-templates/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateCode").value("WELCOME"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_ShouldReturnCreatedTemplate() throws Exception {
        NotificationTemplateDto.CreateRequest request = NotificationTemplateDto.CreateRequest.builder()
                .templateCode("NEW")
                .templateName("New template")
                .subject("Title")
                .body("Content")
                .channel(Notification.NotificationType.EMAIL)
                .build();

        NotificationTemplateDto.Response response = NotificationTemplateDto.Response.builder()
                .id(1L)
                .templateCode("NEW")
                .build();

        when(templateService.create(any(NotificationTemplateDto.CreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/notification-templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.templateCode").value("NEW"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_ShouldReturnUpdatedTemplate() throws Exception {
        NotificationTemplateDto.UpdateRequest request = NotificationTemplateDto.UpdateRequest.builder()
                .templateName("Updated template")
                .subject("New Title")
                .body("New Content")
                .channel(Notification.NotificationType.EMAIL)
                .build();

        NotificationTemplateDto.Response response = NotificationTemplateDto.Response.builder()
                .id(1L)
                .templateName("Updated template")
                .build();

        when(templateService.update(eq(1L), any(NotificationTemplateDto.UpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/notification-templates/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.templateName").value("Updated template"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_ShouldReturnSuccessMessage() throws Exception {
        doNothing().when(templateService).delete(1L);

        mockMvc.perform(delete("/api/v1/notification-templates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Mẫu thông báo đã được xóa thành công."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void toggleActive_ShouldReturnSuccessMessage() throws Exception {
        NotificationTemplateDto.Response response = NotificationTemplateDto.Response.builder()
                .id(1L)
                .active(true)
                .build();

        when(templateService.toggleActive(1L)).thenReturn(response);

        mockMvc.perform(patch("/api/v1/notification-templates/1/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Trạng thái kích hoạt đã được thay đổi."));
    }
}
