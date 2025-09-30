package com.rachnit.blog01.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.request.CreateCommentRequest;
import com.rachnit.blog01.dto.response.CommentResponse;
import com.rachnit.blog01.service.CommentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    /**
     * Create a comment on a post
    */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long postId,
                                                        @Valid @RequestBody CreateCommentRequest request) {
        CommentResponse comment = commentService.createComment(postId, request);
        return ResponseEntity.ok(comment);
    }
    
    /**
     * Get all comments for a post
    */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getPostComments(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }

    /**
     * Delete a comment (owner only)
    */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}