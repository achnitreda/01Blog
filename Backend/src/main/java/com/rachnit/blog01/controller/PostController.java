package com.rachnit.blog01.controller;

import com.rachnit.blog01.dto.request.CreatePostRequest;
import com.rachnit.blog01.dto.request.UpdatePostRequest;
import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.service.PostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<PostResponse> createPost(
        @Valid @RequestBody CreatePostRequest request
    ) {
        PostResponse post = postService.createPost(request);
        return ResponseEntity.ok(post);
    }

    /**
     * Create a new post (Multipart - with file upload)
     *
     * POST /api/posts
     * Content-Type: multipart/form-data
     * Form Data:
     *   - title: string
     *   - content: string
     *   - media: file
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPostWithFile(
        @RequestParam("title") String title,
        @RequestParam("content") String content,
        @RequestParam("media") MultipartFile media
    ) {
        PostResponse post = postService.createPostWithFile(
            title,
            content,
            media
        );
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
    public ResponseEntity<PostResponse> updatePost(
        @PathVariable Long id,
        @Valid @RequestBody UpdatePostRequest request
    ) {
        PostResponse post = postService.updatePost(id, request);
        return ResponseEntity.ok(post);
    }

    /**
     * Update a post (Multipart - with file upload)
     *
     * PUT /api/posts/{id}
     * Content-Type: multipart/form-data
     * Form Data:
     *   - title: string (optional)
     *   - content: string (optional)
     *   - media: file (optional - uploads new media)
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> updatePostWithFile(
        @PathVariable Long id,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "content", required = false) String content,
        @RequestParam(value = "media", required = false) MultipartFile media
    ) {
        PostResponse post = postService.updatePostWithFile(
            id,
            title,
            content,
            media
        );
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
