package com.smartpark.domain.lpr.client;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartpark.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
@Component
public class HttpLprClient implements LprClient {
 private final String url; private final String apiKey; private final ObjectMapper mapper; private final HttpClient http;
 public HttpLprClient(@Value("${app.integration.lpr.url:}") String url,@Value("${app.integration.lpr.api-key:}") String apiKey,ObjectMapper mapper){this.url=url;this.apiKey=apiKey;this.mapper=mapper;this.http=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();}
 public Recognition recognize(byte[] image,String contentType){
  if(url.isBlank()) throw new BusinessException(HttpStatus.SERVICE_UNAVAILABLE,"ERR-LPR-001","LPR provider is not configured");
  try { var req=HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(4)).header("Content-Type",contentType).header("X-Api-Key",apiKey).POST(HttpRequest.BodyPublishers.ofByteArray(image)).build(); var res=http.send(req,HttpResponse.BodyHandlers.ofString()); if(res.statusCode()/100!=2) throw new IllegalStateException(); var json=mapper.readTree(res.body()); return new Recognition(json.path("plateNumber").asText(),json.path("confidence").asDouble()); }
  catch(InterruptedException ex){Thread.currentThread().interrupt();throw new BusinessException(HttpStatus.BAD_GATEWAY,"ERR-LPR-001","LPR provider interrupted");}
  catch(Exception ex){throw new BusinessException(HttpStatus.BAD_GATEWAY,"ERR-LPR-001","LPR provider unavailable");}
 }
}
