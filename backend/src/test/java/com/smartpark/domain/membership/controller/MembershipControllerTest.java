package com.smartpark.domain.membership.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.auth.repository.UserRepository;
import com.smartpark.domain.customer.repository.CustomerRepository;
import com.smartpark.domain.membership.dto.MembershipDto;
import com.smartpark.domain.membership.entity.Membership;
import com.smartpark.domain.membership.repository.MembershipTierRepository;
import com.smartpark.domain.membership.service.MembershipManagementService;
import com.smartpark.domain.membership.service.MembershipService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MembershipController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MembershipControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private MembershipService membershipService;
    @MockBean private MembershipManagementService membershipManagementService;
    @MockBean private UserRepository userRepository;
    @MockBean private CustomerRepository customerRepository;
    @MockBean private MembershipTierRepository membershipTierRepository;

    @MockBean private JwtService jwtService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateMembership() throws Exception {
        MembershipDto.CreateRequest request = new MembershipDto.CreateRequest(1L, 1L, LocalDate.now(), null, false);
        MembershipDto.Response response = MembershipDto.Response.builder()
                .id(1L)
                .membershipCode("MEM-001")
                .customerId(1L)
                .tierId(1L)
                .status(Membership.MembershipStatus.ACTIVE)
                .build();

        when(membershipManagementService.create(any(MembershipDto.CreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/memberships")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.membershipCode").value("MEM-001"));
    }

    @Test
    void testUpgradeMembership() throws Exception {
        MembershipDto.UpgradeRequest request = new MembershipDto.UpgradeRequest(2L);
        MembershipDto.Response response = MembershipDto.Response.builder()
                .id(1L)
                .membershipCode("MEM-001")
                .tierId(2L)
                .tierCode("PLATINUM")
                .status(Membership.MembershipStatus.ACTIVE)
                .build();

        when(membershipManagementService.upgrade(anyLong(), any(MembershipDto.UpgradeRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/memberships/{id}/upgrade", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tierCode").value("PLATINUM"));
    }

    @Test
    void testRenewMembership() throws Exception {
        MembershipDto.RenewRequest request = new MembershipDto.RenewRequest(12);
        MembershipDto.Response response = MembershipDto.Response.builder()
                .id(1L)
                .membershipCode("MEM-001")
                .expirationDate(LocalDate.now().plusYears(1))
                .status(Membership.MembershipStatus.ACTIVE)
                .build();

        when(membershipManagementService.renew(anyLong(), any(MembershipDto.RenewRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/memberships/{id}/renew", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void testCancelMembership() throws Exception {
        MembershipDto.CancelRequest request = new MembershipDto.CancelRequest("No longer required");
        MembershipDto.Response response = MembershipDto.Response.builder()
                .id(1L)
                .membershipCode("MEM-001")
                .status(Membership.MembershipStatus.CANCELLED)
                .build();

        when(membershipManagementService.cancel(anyLong(), any(MembershipDto.CancelRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/api/v1/memberships/{id}/cancel", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }
}
