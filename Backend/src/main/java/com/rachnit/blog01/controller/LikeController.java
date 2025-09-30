package com.rachnit.blog01.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.response.LikeResponse;
import com.rachnit.blog01.service.LikeService;

@RestController
@RequestMapping("/api/posts")
public class LikeController {

    @Autowired
    private LikeService likeService;

    /**
     * Like a post
     */
    @PostMapping("/{postId}/like")
    public ResponseEntity<LikeResponse> likePost(@PathVariable Long postId) {
        LikeResponse response = likeService.likePost(postId);
        return ResponseEntity.ok(response);
    }
    

    /**
     * Unlike a post
     */
    @DeleteMapping("/{postId}/unlike")
    public ResponseEntity<LikeResponse> unlikePost(@PathVariable Long postId) {
        LikeResponse response = likeService.unlikePost(postId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get like status and count for a post
    */
    @GetMapping("/{postId}/likes")
    public ResponseEntity<Map<String, Object>> getPostLikes(@PathVariable Long postId) {
        long likesCount = likeService.getLikesCount(postId);
        boolean isLiked = likeService.hasUserLikedPost(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("likesCount", likesCount);
        response.put("isLiked", isLiked);
        response.put("postId", postId);
        
        return ResponseEntity.ok(response);
    }
}