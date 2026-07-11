package com.smartpark.config;

import io.github.bucket4j.distributed.BucketProxy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.distributed.proxy.RemoteBucketBuilder;
import io.lettuce.core.RedisClient;
import org.mockito.Mockito;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisServerCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Test configuration: replaces all Redis / Bucket4j beans with lightweight in-memory stubs.
 * Activated when profile "test" is active.
 */
@Configuration
@Profile("test")
@SuppressWarnings({"rawtypes", "unchecked"})
public class TestRedisConfig {

    private final Map<String, io.github.bucket4j.distributed.BucketProxy> bucketCache = new ConcurrentHashMap<>();

    /** Dummy Lettuce client — no TCP connection is made. */
    @Bean
    @Primary
    public RedisClient mockRedisClient() {
        return Mockito.mock(RedisClient.class);
    }

    /**
     * In-memory ProxyManager backed by real local Bucket4j buckets (keyed by the byte[] key).
     * This means rate-limit logic (10 req/min) is correctly enforced in integration tests.
     */
    @Bean
    @Primary
    public ProxyManager<byte[]> proxyManager() {
        RemoteBucketBuilder<byte[]> bucketBuilder = Mockito.mock(RemoteBucketBuilder.class);
        Mockito.when(bucketBuilder.build(
                Mockito.any(byte[].class),
                Mockito.any(java.util.function.Supplier.class)))
               .thenAnswer(inv -> {
                   byte[] keyBytes = inv.getArgument(0);
                   String key = new String(keyBytes);
                   java.util.function.Supplier<io.github.bucket4j.BucketConfiguration> supplier = inv.getArgument(1);
                   return bucketCache.computeIfAbsent(key, k -> {
                       io.github.bucket4j.BucketConfiguration cfg = supplier.get();
                       io.github.bucket4j.local.LocalBucketBuilder builder = io.github.bucket4j.Bucket.builder();
                       for (io.github.bucket4j.Bandwidth bw : cfg.getBandwidths()) {
                           builder.addLimit(bw);
                       }
                       io.github.bucket4j.Bucket local = builder.build();
                       io.github.bucket4j.distributed.BucketProxy proxy =
                               Mockito.mock(io.github.bucket4j.distributed.BucketProxy.class);
                       Mockito.when(proxy.tryConsume(Mockito.anyLong()))
                              .thenAnswer(c -> local.tryConsume(c.getArgument(0)));
                       return proxy;
                   });
               });
        Mockito.when(bucketBuilder.build(
                Mockito.any(byte[].class),
                Mockito.any(io.github.bucket4j.BucketConfiguration.class)))
               .thenAnswer(inv -> {
                   byte[] keyBytes = inv.getArgument(0);
                   String key = new String(keyBytes);
                   io.github.bucket4j.BucketConfiguration cfg = inv.getArgument(1);
                   return bucketCache.computeIfAbsent(key, k -> {
                       io.github.bucket4j.local.LocalBucketBuilder builder = io.github.bucket4j.Bucket.builder();
                       for (io.github.bucket4j.Bandwidth bw : cfg.getBandwidths()) {
                           builder.addLimit(bw);
                       }
                       io.github.bucket4j.Bucket local = builder.build();
                       io.github.bucket4j.distributed.BucketProxy proxy =
                               Mockito.mock(io.github.bucket4j.distributed.BucketProxy.class);
                       Mockito.when(proxy.tryConsume(Mockito.anyLong()))
                              .thenAnswer(c -> local.tryConsume(c.getArgument(0)));
                       return proxy;
                   });
               });

        ProxyManager<byte[]> manager = Mockito.mock(ProxyManager.class);
        Mockito.when(manager.builder()).thenReturn(bucketBuilder);
        Mockito.when(manager.isAsyncModeSupported()).thenReturn(false);
        Mockito.when(manager.getProxyConfiguration(Mockito.any())).thenReturn(Optional.empty());

        return manager;
    }

    // ---------------------------------------------------------------------------
    // In-memory StringRedisTemplate (no real Redis)
    // ---------------------------------------------------------------------------

    @Bean
    @Primary
    public RedisConnectionFactory mockRedisConnectionFactory() {
        RedisConnectionFactory factory = Mockito.mock(RedisConnectionFactory.class);
        RedisConnection connection = Mockito.mock(RedisConnection.class);
        RedisServerCommands serverCommands = Mockito.mock(RedisServerCommands.class);
        Mockito.when(factory.getConnection()).thenReturn(connection);
        Mockito.when(connection.serverCommands()).thenReturn(serverCommands);
        
        // Clear bucket cache when Redis flushAll is called
        Mockito.doAnswer(inv -> {
            bucketCache.clear();
            return null;
        }).when(serverCommands).flushAll();
        
        return factory;
    }

    @Bean
    @Primary
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory mockRedisConnectionFactory) {
        // In-memory store for token / blacklist operations
        Map<String, String> store = new ConcurrentHashMap<>();

        return new StringRedisTemplate(mockRedisConnectionFactory) {

            @Override
            public ValueOperations<String, String> opsForValue() {
                ValueOperations<String, String> ops = Mockito.mock(ValueOperations.class);

                Mockito.doAnswer(inv -> {
                    store.put(inv.getArgument(0), inv.getArgument(1));
                    return null;
                }).when(ops).set(Mockito.anyString(), Mockito.anyString());

                Mockito.doAnswer(inv -> {
                    store.put(inv.getArgument(0), inv.getArgument(1));
                    return null;
                }).when(ops).set(
                        Mockito.anyString(), Mockito.anyString(),
                        Mockito.anyLong(), Mockito.any());

                Mockito.doAnswer(inv -> store.get(inv.getArgument(0)))
                       .when(ops).get(Mockito.anyString());

                return ops;
            }

            @Override
            public Boolean hasKey(String key) {
                return store.containsKey(key);
            }

            @Override
            public Boolean delete(String key) {
                return store.remove(key) != null;
            }

            @Override
            public Set<String> keys(String pattern) {
                String prefix = pattern.replace("*", "");
                return store.keySet().stream()
                        .filter(k -> k.startsWith(prefix))
                        .collect(Collectors.toSet());
            }

            @Override
            public Long delete(Collection<String> keys) {
                return keys.stream().filter(k -> store.remove(k) != null).count();
            }
        };
    }
}
