package com.gateos.module.venue.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.venue.dto.VenueRequest;
import com.gateos.module.venue.entity.Venue;
import com.gateos.module.venue.service.VenueService;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = VenueController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VenueService venueService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void shouldGetAllVenues_WhenAnonymous() throws Exception {
        // Arrange
        when(venueService.getAll(any(), any(), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(Venue.builder().id(1L).name("Dam Sen").build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/venues")
                        .param("search", "Dam")
                        .param("status", "ACTIVE")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sort", "name,asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Dam Sen"));
    }

    @Test
    void shouldGetVenueById_WhenAnonymous() throws Exception {
        // Arrange
        when(venueService.getById(1L)).thenReturn(Venue.builder().id(1L).name("Suoi Tien").build());

        // Act & Assert
        mockMvc.perform(get("/api/v1/venues/1")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Suoi Tien"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldCreateVenue_WhenAdmin() throws Exception {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("New Venue Name");
        request.setAddress("123 Street");

        Venue saved = Venue.builder().id(5L).name("New Venue Name").build();
        when(venueService.create(any(VenueRequest.class))).thenReturn(saved);

        // Act & Assert
        mockMvc.perform(post("/api/v1/venues")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(5));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldReturn403_WhenCreateVenueAsManager() throws Exception {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("New Venue Name");
        request.setAddress("123 Street");

        // Act & Assert
        mockMvc.perform(post("/api/v1/venues")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldUpdateVenue_WhenManager() throws Exception {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("Updated Venue Name");
        request.setAddress("456 Street");

        Venue updated = Venue.builder().id(1L).name("Updated Venue Name").build();
        when(venueService.update(eq(1L), any(VenueRequest.class))).thenReturn(updated);

        // Act & Assert
        mockMvc.perform(put("/api/v1/venues/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Updated Venue Name"));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenUpdateVenueAsCustomer() throws Exception {
        // Arrange
        VenueRequest request = new VenueRequest();
        request.setName("Updated Venue Name");
        request.setAddress("456 Street");

        // Act & Assert
        mockMvc.perform(put("/api/v1/venues/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldDeleteVenue_WhenAdmin() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/venues/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(venueService).softDelete(1L);
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldReturn403_WhenDeleteVenueAsManager() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/venues/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
