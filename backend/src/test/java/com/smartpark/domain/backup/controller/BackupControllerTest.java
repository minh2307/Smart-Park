package com.smartpark.domain.backup.controller;

import com.smartpark.domain.backup.dto.BackupDto;
import com.smartpark.domain.backup.entity.BackupJob.BackupTarget;
import com.smartpark.domain.backup.entity.BackupJob.BackupType;
import com.smartpark.domain.backup.service.BackupService;
import com.smartpark.domain.settings.controller.SettingsRequestExceptionHandler;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({BackupController.class, SettingsRequestExceptionHandler.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class BackupControllerTest {
    @Autowired MockMvc mvc;
    @MockBean BackupService backupService;
    @MockBean JwtService jwtService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Test
    void queuesBackupAndReturnsAccepted() throws Exception {
        when(backupService.trigger(any())).thenReturn(BackupDto.Response.builder().jobId("BKP-20260714-0001")
                .status("QUEUED").backupType(BackupType.FULL).target(BackupTarget.MYSQL)
                .requestedBy(1L).requestedAt(LocalDateTime.now()).build());
        mvc.perform(post("/api/v1/settings/backup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"backupType\":\"FULL\",\"target\":\"MYSQL\",\"reason\":\"release\"}"))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value(202))
                .andExpect(jsonPath("$.data.status").value("QUEUED"));
    }

    @Test
    void rejectsUnsupportedBackupType() throws Exception {
        mvc.perform(post("/api/v1/settings/backup").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"backupType\":\"SNAPSHOT\",\"target\":\"MYSQL\"}"))
                .andExpect(status().isBadRequest());
    }
}
