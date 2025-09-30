package com.rachnit.blog01.service;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rachnit.blog01.dto.request.CreateCommentRequest;
import com.rachnit.blog01.dto.response.CommentResponse;
import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.Comment;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.CommentRepository;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.UserRepository;

@Service
@Transactional
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Create a comment on a post
     */
    public CommentResponse createComment(Long postId, CreateCommentRequest request) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Comment comment = new Comment(request.getContent(), currentUser, post);
        Comment savedComment = commentRepository.save(comment);
        
        return convertToCommentResponse(savedComment, currentUser);
    }

    /**
     * Get all comments for a post
     */
    public List<CommentResponse> getPostComments(Long postId) {
        User currentUser = getCurrentUser();
        
        // Verify post exists
        postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        List<Comment> comments = commentRepository.findByPost_IdOrderByCreatedAtDesc(postId);
        
        return comments.stream()
                .map(comment -> convertToCommentResponse(comment, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * Delete a comment (owner only)
     */
    public void deleteComment(Long commentId) {
        User currentUser = getCurrentUser();
        
        // Verify ownership
        Comment comment = commentRepository.findByIdAndAuthor(commentId, currentUser)
                .orElseThrow(() -> new RuntimeException("Comment not found or you don't have permission to delete it"));
        
        commentRepository.delete(comment);
    }

    /**
     * Get comments count for a post
     */
    public long getCommentsCount(Long postId) {
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return commentRepository.countByPost(post);
    }

    /**
     * Convert Comment entity to CommentResponse DTO
     */
    private CommentResponse convertToCommentResponse(Comment comment, User currentUser) {
        boolean isOwner = comment.getAuthor().getId().equals(currentUser.getId());
        
        return new CommentResponse(
            comment.getId(),
            comment.getContent(),
            comment.getAuthor().getId(),
            comment.getAuthor().getUsername(),
            comment.getPost().getId(),
            isOwner,
            comment.getCreatedAt()
        );
    }
}