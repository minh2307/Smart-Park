package com.gateos.module.attraction.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gateos.config.SecurityConfig;
import com.gateos.module.attraction.dto.AttractionRequest;
import com.gateos.module.attraction.entity.Attraction;
import com.gateos.module.attraction.service.AttractionService;
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

@WebMvcTest(controllers = AttractionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AttractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AttractionService attractionService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    void shouldGetAttractionsByVenue_WhenAnonymous() throws Exception {
        // Arrange
        when(attractionService.getByVenue(eq(1L), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(Attraction.builder().id(10L).name("Roller Coaster").build())));

        // Act & Assert
        mockMvc.perform(get("/api/v1/venues/1/attractions")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Roller Coaster"));
    }

    @Test
    void shouldGetAttractionById_WhenAnonymous() throws Exception {
        // Arrange
        when(attractionService.getById(10L))
                .thenReturn(Attraction.builder().id(10L).name("Ferris Wheel").build());

        // Act & Assert
        mockMvc.perform(get("/api/v1/attractions/10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Ferris Wheel"));
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldCreateAttraction_WhenManager() throws Exception {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Carousel");
        request.setCapacity(30);

        Attraction saved = Attraction.builder().id(20L).name("Carousel").build();
        when(attractionService.create(any(AttractionRequest.class))).thenReturn(saved);

        // Act & Assert
        mockMvc.perform(post("/api/v1/attractions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(20));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenCreateAttractionAsCustomer() throws Exception {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Carousel");
        request.setCapacity(30);

        // Act & Assert
        mockMvc.perform(post("/api/v1/attractions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldReturn422_WhenCreateAttractionIsInvalid() throws Exception {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(null); // invalid
        request.setName("C"); // too short
        request.setCapacity(0); // must be >= 1

        // Act & Assert
        mockMvc.perform(post("/api/v1/attractions")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR-VALIDATION-001"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldUpdateAttraction_WhenAdmin() throws Exception {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Carousel Updated");
        request.setCapacity(40);

        Attraction updated = Attraction.builder().id(10L).name("Carousel Updated").build();
        when(attractionService.update(eq(10L), any(AttractionRequest.class))).thenReturn(updated);

        // Act & Assert
        mockMvc.perform(put("/api/v1/attractions/10")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Carousel Updated"));
    }

    @Test
    @WithMockUser(username = "customer", roles = {"CUSTOMER"})
    void shouldReturn403_WhenUpdateAttractionAsCustomer() throws Exception {
        // Arrange
        AttractionRequest request = new AttractionRequest();
        request.setVenueId(1L);
        request.setName("Carousel");
        request.setCapacity(30);

        // Act & Assert
        mockMvc.perform(put("/api/v1/attractions/10")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void shouldDeleteAttraction_WhenManager() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/v1/attractions/10")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(attractionService).softDelete(10L);
    }
}
