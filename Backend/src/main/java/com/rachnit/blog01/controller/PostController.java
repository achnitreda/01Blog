package com.rachnit.blog01.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.request.CreatePostRequest;
import com.rachnit.blog01.dto.request.UpdatePostRequest;
import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.service.PostService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;

    /**
     * Get all posts (main feed)
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    /**
     * Get personalized feed (posts from users you follow)
     */
     @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getPersonalizedFeed() {
        List<PostResponse> posts = postService.getPersonalizedFeed();
        return ResponseEntity.ok(posts);
    }

    /**
     * Create a new post
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse post = postService.createPost(request);
        return ResponseEntity.ok(post);
    }

    /**
     * Get specific post by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        PostResponse post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    /**
     * Update a post (owner only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, 
                                                  @Valid @RequestBody UpdatePostRequest request) {
        PostResponse post = postService.updatePost(id, request);
        return ResponseEntity.ok(post);
    }

    /**
     * Delete a post (owner only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Get current user's posts
     */
    @GetMapping("/my-posts")
    public ResponseEntity<List<PostResponse>> getMyPosts() {
        List<PostResponse> posts = postService.getMyPosts();
        return ResponseEntity.ok(posts);
    }
}