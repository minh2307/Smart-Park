package com.gateos.module.staff.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.auth.entity.Staff;
import com.gateos.module.auth.repository.StaffRepository;
import com.gateos.security.JwtAuthenticationFilter;
import com.gateos.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StaffController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class StaffControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StaffRepository staffRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetAllStaff_WhenAdmin() throws Exception {
        // Arrange
        when(staffRepository.findAll(any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(new Staff())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/staff")
                        .param("page", "0")
                        .param("size", "20")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenGetAllStaffAsCustomer() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/staff"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldCreateStaff_WhenValid() throws Exception {
        // Arrange
        StaffController.StaffRequest request = new StaffController.StaffRequest();
        request.setVenueId(1L);
        request.setUsername("staff1");
        request.setPassword("password123");
        request.setFullName("John Doe");
        request.setEmail("john.doe@example.com");
        request.setRole(Staff.StaffRole.GATE_STAFF);

        when(staffRepository.existsByUsername("staff1")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        Staff savedStaff = Staff.builder()
                .id(10L)
                .username("staff1")
                .role(Staff.StaffRole.GATE_STAFF)
                .status(Staff.StaffStatus.ACTIVE)
                .build();
        when(staffRepository.save(any(Staff.class))).thenReturn(savedStaff);

        // Act & Assert
        mockMvc.perform(post("/api/v1/staff")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tạo nhân sự thành công"))
                .andExpect(jsonPath("$.data.id").value(10L));

        verify(staffRepository).save(any(Staff.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldThrowConflict_WhenUsernameAlreadyExists() throws Exception {
        // Arrange
        StaffController.StaffRequest request = new StaffController.StaffRequest();
        request.setVenueId(1L);
        request.setUsername("existingUser");
        request.setPassword("pass");
        request.setFullName("Jane Doe");
        request.setRole(Staff.StaffRole.GATE_STAFF);

        when(staffRepository.existsByUsername("existingUser")).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/api/v1/staff")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-STF-001"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldReturn422_WhenCreateStaffBodyIsInvalid() throws Exception {
        // Arrange
        StaffController.StaffRequest request = new StaffController.StaffRequest();
        request.setUsername(""); // Invalid blank

        // Act & Assert
        mockMvc.perform(post("/api/v1/staff")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldUpdateStaff_WhenExists() throws Exception {
        // Arrange
        StaffController.StaffRequest request = new StaffController.StaffRequest();
        request.setVenueId(2L);
        request.setUsername("staff1");
        request.setPassword("password123");
        request.setFullName("Updated Name");
        request.setEmail("updated@example.com");
        request.setRole(Staff.StaffRole.MANAGER);

        Staff existing = Staff.builder().id(10L).username("staff1").build();
        when(staffRepository.findById(10L)).thenReturn(Optional.of(existing));

        Staff updated = Staff.builder().id(10L).fullName("Updated Name").build();
        when(staffRepository.save(any(Staff.class))).thenReturn(updated);

        // Act & Assert
        mockMvc.perform(put("/api/v1/staff/10")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Cập nhật nhân sự thành công"));

        verify(staffRepository).save(any(Staff.class));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldThrowNotFound_WhenUpdateStaffDoesNotExist() throws Exception {
        // Arrange
        StaffController.StaffRequest request = new StaffController.StaffRequest();
        request.setVenueId(1L);
        request.setUsername("staff1");
        request.setPassword("password");
        request.setFullName("John Doe");
        request.setRole(Staff.StaffRole.GATE_STAFF);

        when(staffRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/v1/staff/99")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-STF-002"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldDeactivateStaff_WhenExists() throws Exception {
        // Arrange
        Staff existing = Staff.builder().id(10L).username("staff1").status(Staff.StaffStatus.ACTIVE).build();
        when(staffRepository.findById(10L)).thenReturn(Optional.of(existing));

        // Act & Assert
        mockMvc.perform(delete("/api/v1/staff/10")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Nhân sự đã bị vô hiệu hóa"));

        assertEquals(Staff.StaffStatus.INACTIVE, existing.getStatus());
        verify(staffRepository).save(existing);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldThrowNotFound_WhenDeactivateStaffDoesNotExist() throws Exception {
        // Arrange
        when(staffRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(delete("/api/v1/staff/99")
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }
}
