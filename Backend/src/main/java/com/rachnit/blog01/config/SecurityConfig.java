package com.rachnit.blog01.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.rachnit.blog01.security.JwtAuthenticationEntryPoint;
import com.rachnit.blog01.security.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    
    @Autowired
    private DatabaseProperties databaseProperties;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        HttpSecurity httpSecurity = http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> {
                    authz.requestMatchers("/api/auth/**").permitAll()
                         .requestMatchers("/error").permitAll()
                         .requestMatchers("/api/admin/**").hasRole("ADMIN");
                    
                    if (databaseProperties.isEnableH2Console()) {
                        authz.requestMatchers("/h2-console/**").permitAll();
                    }
                    
                    authz.anyRequest().authenticated();
                });
        
        if (databaseProperties.isEnableH2Console()) {
            httpSecurity.headers(headers -> headers
                    .frameOptions(frameOptions -> frameOptions.sameOrigin())
            );
        }
        
        return httpSecurity
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .sessionManagement(session -> 
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
