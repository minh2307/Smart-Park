package com.smartpark.domain.device.service;
import com.smartpark.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
@Service @RequiredArgsConstructor
public class DeviceRateLimitService {
 private final StringRedisTemplate redis;
 @Value("${app.rate-limit.device-capacity:120}") private int capacity;
 private final ConcurrentMap<String,AtomicInteger> local=new ConcurrentHashMap<>();
 public void check(String deviceCode){String bucket=deviceCode+":"+Instant.now().getEpochSecond()/60;long count;try{String key="device:rate:"+bucket;Long value=redis.opsForValue().increment(key);if(value==null)throw new IllegalStateException();if(value==1)redis.expire(key,Duration.ofMinutes(2));count=value;}catch(RuntimeException unavailable){count=local.computeIfAbsent(bucket,k->new AtomicInteger()).incrementAndGet();if(local.size()>10000)local.clear();}if(count>capacity)throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS,"ERR-DEVICE-429","Device rate limit exceeded");}
}
