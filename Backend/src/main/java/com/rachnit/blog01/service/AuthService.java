package com.rachnit.blog01.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rachnit.blog01.dto.request.LoginRequest;
import com.rachnit.blog01.dto.request.RegisterRequest;
import com.rachnit.blog01.dto.response.AuthResponse;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.enums.Role;
import com.rachnit.blog01.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;  // Login validator

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setActive(true);

        // Save to database
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        // Validate credentials using AuthenticationManager
        /*
        - AuthenticationManager uses UserDetailsServiceImpl to load user
        - AuthenticationManager uses PasswordEncoder to check password
        */
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getUsername(), user.getEmail(), user.getRole());
    }   
}