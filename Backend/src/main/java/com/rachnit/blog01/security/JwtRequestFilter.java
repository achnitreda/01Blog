package com.rachnit.blog01.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.rachnit.blog01.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter  {
    
    @Autowired
    private JwtService jwtService;

    // loads users from database
    @Autowired
    private UserDetailsService userDetailsService;


    /**
     * This method runs ONCE for every HTTP request
     * It's our chance to validate JWT tokens before SecurityConfig checks authentication
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response, 
                                FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);
            try {
                username = jwtService.extractUsername(jwtToken);
            } catch (Exception e) {
                System.out.println("JWT Token extraction failed: " + e.getMessage());
            }
        }

        // If we got a username and no one is authenticated yet
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.validateToken(jwtToken, userDetails)) {

                // Create authentication token
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,                
                        null, // Credentials (no password needed, JWT is proof)
                        userDetails.getAuthorities()   // Authorities (roles/permissions)
                );

                // Set additional details
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Tell Spring Security "This user is now authenticated!"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}