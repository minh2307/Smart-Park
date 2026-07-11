package com.smartpark.domain.ride.controller;

import com.smartpark.domain.ride.entity.Ride;
import com.smartpark.domain.ride.service.RideService;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Map;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import com.smartpark.security.JwtAuthenticationFilter;
import com.smartpark.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@WebMvcTest(RideController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class RideControllerTest {

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.smartpark.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RideService rideService;

    @Test
    @WithMockUser(authorities = {"USER"})
    void getAllRides_ShouldReturnOk() throws Exception {
        Ride ride = new Ride();
        ride.setId(1L);
        ride.setName("Roller Coaster");
        ride.setCode("R01");

        when(rideService.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(ride)));

        mockMvc.perform(get("/api/v1/rides")
                .param("page", "0")
                .param("size", "10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].name").value("Roller Coaster"));
    }

    @Test
    @WithMockUser(authorities = {"USER"})
    void getRide_ShouldReturnOk() throws Exception {
        Ride ride = new Ride();
        ride.setId(1L);
        ride.setName("Roller Coaster");

        when(rideService.findById(1L)).thenReturn(ride);

        mockMvc.perform(get("/api/v1/rides/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Roller Coaster"));
    }

    @Test
    @WithMockUser(authorities = {"USER"})
    void getQueueInfo_ShouldReturnOk() throws Exception {
        when(rideService.getQueueInfo(1L)).thenReturn(Map.of(
                "rideId", 1L,
                "estimatedWaitTimeMinutes", 15
        ));

        mockMvc.perform(get("/api/v1/rides/1/queue")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.estimatedWaitTimeMinutes").value(15));
    }
}
