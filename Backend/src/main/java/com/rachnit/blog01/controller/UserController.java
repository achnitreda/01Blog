package com.rachnit.blog01.controller;

import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.dto.response.UserProfileResponse;
import com.rachnit.blog01.service.PostService;
import com.rachnit.blog01.service.UserService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        List<UserProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get posts by specific user
     */
    @GetMapping("/{userId}/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(
        @PathVariable Long userId
    ) {
        List<PostResponse> posts = postService.getUserPosts(userId);
        return ResponseEntity.ok(posts);
    }
}
