package com.smartpark.domain.weather.client;
import com.smartpark.domain.weather.dto.WeatherForecastResponse.ForecastDay;
import java.time.LocalDate;
import java.util.List;
public interface WeatherClient { Result getForecast(double latitude,double longitude,LocalDate date,int days); record Result(String provider,List<ForecastDay> forecasts){} }
