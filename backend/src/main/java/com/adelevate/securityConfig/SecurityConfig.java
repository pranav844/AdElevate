package com.adelevate.securityConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ✅ Public endpoints
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/logger-test/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // ✅ Admin-only ad moderation
                .requestMatchers(HttpMethod.PUT, "/api/ads/*/approve", "/api/ads/*/reject").hasRole("ADMIN")

                // ✅ Vendor / Admin Ad creation & management
                .requestMatchers(HttpMethod.POST, "/api/ads", "/api/ads/").hasAnyRole("VENDOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/ads/vendor/*", "/api/ads/vendor/**").hasAnyRole("VENDOR", "ADMIN")

                // ✅ Public Ad browsing & Payment Microservice status update
                .requestMatchers(HttpMethod.GET, "/api/ads", "/api/ads/*", "/api/ads/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/ads/*/status").permitAll()

                // ✅ Subscription plans: anyone can browse, only admins can manage
                .requestMatchers(HttpMethod.GET, "/api/subscription-plans/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/subscription-plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/subscription-plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/subscription-plans/**").hasRole("ADMIN")

                // ✅ Allow all CORS Preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ✅ Role-based restrictions
                .requestMatchers("/api/admins/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/locations/**").hasRole("ADMIN")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .requestMatchers("/api/vendors/**").hasRole("VENDOR")
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/ratings/**").permitAll()

                // ✅ All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}