package com.smartpark.config;

import com.smartpark.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    private static final String[] PUBLIC_PATHS = {
            // Auth
            "/api/v1/auth/**",
            // Payment webhooks
            "/api/v1/payments/vnpay-ipn",
            "/api/v1/payments/vnpay-return",
            "/api/v1/payments/momo-webhook",
            // Public park/ride info
            "/api/v1/parks",
            "/api/v1/parks/{id}",
            "/api/v1/parks/{id}/zones",
            "/api/v1/zones",
            "/api/v1/rides",
            "/api/v1/rides/{id}",
            "/api/v1/ticket-types",
            "/api/v1/ticket-types/{id}",
            // Swagger & Actuator
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/actuator/health"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/rides/**").permitAll()

                        // SYSTEM_ADMIN only
                        .requestMatchers("/api/v1/admin/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/parks/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/departments").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/employees").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER")

                        // PARK_MANAGER
                        .requestMatchers("/api/v1/employees/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER")
                        .requestMatchers("/api/v1/maintenance/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER", "MAINTENANCE_TECH")
                        .requestMatchers("/api/v1/inspections/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER", "MAINTENANCE_TECH")

                        // Operational Staff
                        .requestMatchers("/api/v1/incidents").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER", "OPERATIONS_STAFF")
                        .requestMatchers("/api/v1/parking/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER", "OPERATIONS_STAFF")

                        // BI / Analytics
                        .requestMatchers("/api/v1/bi/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER")
                        .requestMatchers("/api/v1/analytics/**").hasAnyRole("SYSTEM_ADMIN", "PARK_MANAGER")

                        // Any authenticated user for the rest
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
