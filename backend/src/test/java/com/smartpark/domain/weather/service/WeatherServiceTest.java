package com.smartpark.domain.weather.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.weather.client.WeatherClient;
import com.smartpark.domain.weather.dto.WeatherForecastResponse;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.data.redis.core.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class WeatherServiceTest {
 @Mock ParkRepository parks;@Mock WeatherClient client;@Mock StringRedisTemplate redis;@Mock ValueOperations<String,String> values;@Mock AuditLogService audit;@Mock com.smartpark.domain.settings.service.FeatureFlagService featureFlags;WeatherService service;
 @BeforeEach void init(){MockitoAnnotations.openMocks(this);when(redis.opsForValue()).thenReturn(values);service=new WeatherService(parks,client,redis,new ObjectMapper().findAndRegisterModules(),audit,featureFlags);}
 @Test void providerResultIsNormalizedWhenRedisIsUnavailable(){Park p=Park.builder().id(1L).address("HCM").latitude(BigDecimal.valueOf(10.77)).longitude(BigDecimal.valueOf(106.69)).build();when(parks.findById(1L)).thenReturn(Optional.of(p));when(values.get(anyString())).thenThrow(new IllegalStateException("redis down"));var day=new WeatherForecastResponse.ForecastDay(LocalDate.now(),"RAIN",25,31,80,70,12);when(client.getForecast(anyDouble(),anyDouble(),any(),eq(1))).thenReturn(new WeatherClient.Result("provider",List.of(day)));var response=service.get(1L,null,1);assertFalse(response.stale());assertEquals("RAIN",response.forecasts().get(0).condition());}
}
