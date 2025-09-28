package com.rachnit.blog01.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.service.PostService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private PostService postService;

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        return ResponseEntity.ok("Hello " + username + "! You are authenticated!");
    }
    
    /**
     * Get posts by specific user
     */
    @GetMapping("/{userId}/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable Long userId) {
        List<PostResponse> posts = postService.getUserPosts(userId);
        return ResponseEntity.ok(posts);
    }
}