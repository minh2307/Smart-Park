package com.smartpark.domain.weather.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.*;
import com.smartpark.domain.audit.entity.AuditLog;
import com.smartpark.domain.audit.service.AuditLogService;
import com.smartpark.domain.park.entity.Park;
import com.smartpark.domain.park.repository.ParkRepository;
import com.smartpark.domain.weather.client.WeatherClient;
import com.smartpark.domain.weather.dto.WeatherForecastResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.concurrent.TimeUnit;
@Service @RequiredArgsConstructor @Slf4j
public class WeatherService {
 private final ParkRepository parks; private final WeatherClient client; private final StringRedisTemplate redis; private final ObjectMapper mapper; private final AuditLogService audit; private final com.smartpark.domain.settings.service.FeatureFlagService featureFlags;
 public WeatherForecastResponse get(Long parkId,LocalDate date,int days){featureFlags.requireEnabled(com.smartpark.domain.settings.service.FeatureFlagService.FeatureFlag.WEATHER_INTEGRATION);Park park=parks.findById(parkId).orElseThrow(()->new ResourceNotFoundException("Park",parkId));if(park.getLatitude()==null||park.getLongitude()==null)throw new BusinessException("ERR-WEATHER-002","Park weather location is not configured");LocalDate start=date==null?LocalDate.now():date;String suffix=parkId+":"+start+":"+days;String fresh="weather:fresh:"+suffix,stale="weather:stale:"+suffix;WeatherForecastResponse cached=read(fresh);if(cached!=null)return cached;
  try{var result=client.getForecast(park.getLatitude().doubleValue(),park.getLongitude().doubleValue(),start,days);var response=new WeatherForecastResponse(parkId,park.getWeatherLocationCode()==null?park.getAddress():park.getWeatherLocationCode(),result.forecasts(),result.provider(),LocalDateTime.now(),false);write(fresh,response,30,TimeUnit.MINUTES);write(stale,response,24,TimeUnit.HOURS);return response;}catch(RuntimeException providerFailure){try{audit.create(AuditLog.builder().action("WEATHER_FAILURE").targetTable("parks").recordId(parkId).newValues("{\"result\":\"PROVIDER_UNAVAILABLE\"}").build());}catch(RuntimeException auditFailure){log.error("Unable to persist weather failure audit",auditFailure);}WeatherForecastResponse old=read(stale);if(old!=null)return new WeatherForecastResponse(old.parkId(),old.location(),old.forecasts(),old.provider(),old.cachedAt(),true);if(providerFailure instanceof BusinessException)throw providerFailure;throw new BusinessException(HttpStatus.BAD_GATEWAY,"ERR-WEATHER-001","Weather provider unavailable");}}
 private WeatherForecastResponse read(String key){try{String json=redis.opsForValue().get(key);return json==null?null:mapper.readValue(json,WeatherForecastResponse.class);}catch(Exception ex){log.warn("Weather cache read failed");return null;}}
 private void write(String key,WeatherForecastResponse value,long ttl,TimeUnit unit){try{redis.opsForValue().set(key,mapper.writeValueAsString(value),ttl,unit);}catch(Exception ex){log.warn("Weather cache write failed");}}
}
