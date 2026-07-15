package com.smartpark.domain.weather.dto;
import java.time.*;
import java.util.List;
public record WeatherForecastResponse(Long parkId,String location,List<ForecastDay> forecasts,String provider,LocalDateTime cachedAt,boolean stale){
 public record ForecastDay(LocalDate date,String condition,double temperatureMin,double temperatureMax,int humidity,int rainProbability,double windSpeed){}
}
