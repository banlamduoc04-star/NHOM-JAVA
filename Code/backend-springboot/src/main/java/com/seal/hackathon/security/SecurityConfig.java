package com.seal.hackathon.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .headers(headers ->
                        headers.frameOptions(
                                frame -> frame.sameOrigin()
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // OPTIONS cho FE
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // Public API
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login",
                                "/assets/**",
                                "/favicon.ico",
                                "/error",
                                "/api/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/h2-console/**"
                        )
                        .permitAll()


                        // Dashboard đọc dữ liệu
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/events",
                                "/api/events/**",
                                "/api/tracks",
                                "/api/tracks/**",
                                "/api/rounds",
                                "/api/rounds/**",
                                "/api/rankings",
                                "/api/rankings/**"
                        )
                        .authenticated()


                        // Admin và giám khảo được xem tiêu chí;
                        // quyền ghi vẫn do Controller giới hạn.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/event-criteria/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_EventCoordinator",
                                "ROLE_Admin",
                                "ROLE_Judge",
                                "ROLE_GuestJudge"
                        )


                        // Các API quản lý chỉ dành cho điều phối viên
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/events/**",
                                "/api/tracks/**",
                                "/api/rounds/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_EventCoordinator",
                                "ROLE_Admin"
                        )


                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/events/**",
                                "/api/tracks/**",
                                "/api/rounds/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_EventCoordinator",
                                "ROLE_Admin"
                        )


                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/events/**",
                                "/api/tracks/**",
                                "/api/rounds/**"
                        )
                        .hasAnyAuthority(
                                "ROLE_EventCoordinator",
                                "ROLE_Admin"
                        )


                        // Còn lại bắt buộc login
                        .anyRequest()
                        .authenticated()
                )


                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}")
            String allowedOrigins
    ) {

        CorsConfiguration configuration = new CorsConfiguration();


        configuration.setAllowedOrigins(
                Arrays.asList(
                        allowedOrigins.split(",")
                )
        );


        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}