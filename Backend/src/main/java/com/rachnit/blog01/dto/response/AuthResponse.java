package com.rachnit.blog01.dto.response;

import com.rachnit.blog01.enums.Role;

public class AuthResponse {

    private String token;
    private String username;
    private String email;
    private Role role;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String email, Role role) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    // Getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}