package com.smartpark.domain.weather.client;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import com.smartpark.domain.weather.dto.WeatherForecastResponse.ForecastDay;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
@Component
public class HttpWeatherClient implements WeatherClient {
 private final String baseUrl,apiKey,provider; private final ObjectMapper mapper; private final HttpClient http; private final AtomicInteger failures=new AtomicInteger(); private volatile Instant openUntil=Instant.EPOCH;
 public HttpWeatherClient(@Value("${app.integration.weather.url:}")String url,@Value("${app.integration.weather.api-key:}")String key,@Value("${app.integration.weather.provider:Configured Weather Provider}")String provider,ObjectMapper mapper){this.baseUrl=url;this.apiKey=key;this.provider=provider;this.mapper=mapper;this.http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();}
 public Result getForecast(double lat,double lon,LocalDate date,int days){if(baseUrl.isBlank())throw unavailable();if(Instant.now().isBefore(openUntil))throw unavailable();Exception last=null;for(int attempt=0;attempt<2;attempt++){try{String sep=baseUrl.contains("?")?"&":"?";URI uri=URI.create(baseUrl+sep+"latitude="+lat+"&longitude="+lon+"&date="+date+"&days="+days);var req=HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(4)).header("X-Api-Key",apiKey).GET().build();var res=http.send(req,HttpResponse.BodyHandlers.ofString());if(res.statusCode()/100!=2)throw new IllegalStateException();var root=mapper.readTree(res.body());List<ForecastDay> out=new ArrayList<>();for(var n:root.path("forecasts")){out.add(new ForecastDay(LocalDate.parse(n.path("date").asText()),n.path("condition").asText("UNKNOWN"),n.path("temperatureMin").asDouble(),n.path("temperatureMax").asDouble(),n.path("humidity").asInt(),n.path("rainProbability").asInt(),n.path("windSpeed").asDouble()));}if(out.isEmpty())throw new IllegalStateException();failures.set(0);return new Result(provider,List.copyOf(out));}catch(InterruptedException ex){Thread.currentThread().interrupt();last=ex;break;}catch(Exception ex){last=ex;}}
  if(failures.incrementAndGet()>=3)openUntil=Instant.now().plusSeconds(60);throw unavailable();}
 private BusinessException unavailable(){return new BusinessException(HttpStatus.BAD_GATEWAY,"ERR-WEATHER-001","Weather provider unavailable");}
}
