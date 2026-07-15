package com.smartpark.domain.settings.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.settings.dto.FeatureFlagDto;
import com.smartpark.domain.settings.dto.SecurityPolicyDto;
import com.smartpark.domain.settings.service.FeatureFlagService;
import com.smartpark.domain.settings.service.SecurityPolicyService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({SettingsController.class, SettingsRequestExceptionHandler.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SettingsControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean FeatureFlagService featureFlagService;
    @MockBean SecurityPolicyService securityPolicyService;
    @MockBean JwtService jwtService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Test
    void getsFeatureFlagsInEnvelope() throws Exception {
        when(featureFlagService.get()).thenReturn(FeatureFlagDto.Response.builder().posEnabled(true).build());
        mvc.perform(get("/api/v1/settings/flags"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.posEnabled").value(true));
    }

    @Test
    void partialFlagUpdateDoesNotRequireUnspecifiedFields() throws Exception {
        when(featureFlagService.update(any())).thenReturn(FeatureFlagDto.Response.builder().posEnabled(false).build());
        mvc.perform(put("/api/v1/settings/flags").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"posEnabled\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.posEnabled").value(false));
    }

    @Test
    void rejectsUnknownFeatureFlag() throws Exception {
        mvc.perform(put("/api/v1/settings/flags").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"unknownFlag\":true}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsSecurityPolicyWhenRefreshIsShorter() throws Exception {
        SecurityPolicyDto.UpdateRequest request = SecurityPolicyDto.UpdateRequest.builder()
                .passwordMinLength(8).passwordRequireUppercase(true).passwordRequireLowercase(true)
                .passwordRequireNumber(true).passwordRequireSpecialCharacter(true).bcryptStrength(12)
                .accessTokenMinutes(1440).refreshTokenDays(1).maxLoginAttempts(5)
                .loginAttemptWindowMinutes(10).accountLockMinutes(30).mfaRequiredForAdmin(false)
                .sessionIdleTimeoutMinutes(30).build();
        mvc.perform(put("/api/v1/settings/security").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
