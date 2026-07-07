package com.gateos.module.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.auth.dto.LoginRequest;
import com.gateos.module.auth.dto.RegisterRequest;
import com.gateos.module.auth.dto.TokenResponse;
import com.gateos.module.auth.entity.Customer;
import com.gateos.module.auth.service.AuthService;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void shouldLoginCustomer_WhenRequestIsValid() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("cust1");
        request.setPassword("password");
        request.setUserType("CUSTOMER");

        TokenResponse tokenResponse = TokenResponse.builder()
                .accessToken("access")
                .refreshToken("refresh")
                .build();

        when(authService.loginCustomer(any(LoginRequest.class))).thenReturn(tokenResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công"))
                .andExpect(jsonPath("$.data.accessToken").value("access"));

        verify(authService).loginCustomer(any(LoginRequest.class));
    }

    @Test
    void shouldLoginStaff_WhenRequestIsValid() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("staff1");
        request.setPassword("password");
        request.setUserType("STAFF");

        TokenResponse tokenResponse = TokenResponse.builder()
                .accessToken("staff-access")
                .refreshToken("staff-refresh")
                .build();

        when(authService.loginStaff(any(LoginRequest.class))).thenReturn(tokenResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("staff-access"));

        verify(authService).loginStaff(any(LoginRequest.class));
    }

    @Test
    void shouldRegisterCustomer_WhenRequestIsValid() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setPassword("Password123!"); // must match regex
        request.setEmail("new@example.com");
        request.setFullName("New User");
        request.setPhone("0987654321");

        Customer customer = Customer.builder()
                .id(99L)
                .username("newuser")
                .email("new@example.com")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(customer);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(99))
                .andExpect(jsonPath("$.data.username").value("newuser"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void shouldReturn422_WhenRegisterRequestIsInvalid() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("us"); // too short
        request.setPassword("weak"); // does not match password regex
        request.setEmail("not-an-email");
        request.setFullName(""); // blank
        request.setPhone("12345"); // invalid phone regex

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-VALIDATION-001"));

        verify(authService, never()).register(any(RegisterRequest.class));
    }

    @Test
    void shouldRefreshToken_WhenRequestIsValid() throws Exception {
        // Arrange
        Map<String, String> body = Map.of("refreshToken", "old-refresh-token");
        TokenResponse tokenResponse = TokenResponse.builder()
                .accessToken("new-access")
                .refreshToken("new-refresh")
                .build();

        when(authService.refreshToken("old-refresh-token")).thenReturn(tokenResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access"));

        verify(authService).refreshToken("old-refresh-token");
    }

    @Test
    @WithMockUser(username = "mockuser", roles = {"CUSTOMER"})
    void shouldGetMe_WhenAuthenticated() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/auth/me")
                        .with(csrf())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("mockuser"));
    }
}
