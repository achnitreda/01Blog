package com.rachnit.blog01.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rachnit.blog01.dto.request.CreatePostRequest;
import com.rachnit.blog01.dto.request.UpdatePostRequest;
import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.CommentRepository;
import com.rachnit.blog01.repository.LikeRepository;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.SubscriptionRepository;
import com.rachnit.blog01.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
/**
 * Keeps Hibernate session open during entire method execution
 * Allows lazy relationships to load when accessed
 */
@Transactional 
public class PostService {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    /**
    * Get current authenticated user
    */
    private User getCurrentUser() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PostResponse createPost(CreatePostRequest request) {
        User currentUser = getCurrentUser();

        BlogPost post = new BlogPost(
            request.getTitle(),
            request.getContent(),
            request.getMediaUrl(),
            request.getMediaType(),
            currentUser
        );

        BlogPost savedPost = postRepository.save(post);
        return convertToPostResponse(savedPost, currentUser);
    }

    public PostResponse getPostById(Long postId) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return convertToPostResponse(post, currentUser);
    }

    public PostResponse updatePost(Long postId, UpdatePostRequest request) {
        User currentUser = getCurrentUser();

         // Verify ownership
        BlogPost post = postRepository.findByIdAndAuthor(postId, currentUser)
                .orElseThrow(() -> new RuntimeException("Post not found or you don't have permission to edit it"));
        
        // Update only provided fields
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMediaUrl() != null) {
            post.setMediaUrl(request.getMediaUrl());
        }
        if (request.getMediaType() != null) {
            post.setMediaType(request.getMediaType());
        }

        BlogPost updatedPost = postRepository.save(post);
        return convertToPostResponse(updatedPost, currentUser);
    }

    public void deletePost(Long postId) {
        User currentUser = getCurrentUser();
        
        // Verify ownership
        BlogPost post = postRepository.findByIdAndAuthor(postId, currentUser)
                .orElseThrow(() -> new RuntimeException("Post not found or you don't have permission to delete it"));
        
        postRepository.delete(post);
    }

    public List<PostResponse> getUserPosts(Long userId) {
        User currentUser = getCurrentUser();
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<BlogPost> posts = postRepository.findByAuthor_IdOrderByCreatedAtDesc(userId);
        return posts.stream()
                .map(post -> convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    public List<PostResponse> getMyPosts() {
        User currentUser = getCurrentUser();
        return getUserPosts(currentUser.getId());
    }

    public List<PostResponse> getAllPosts() {
        User currentUser = getCurrentUser();
        List<BlogPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    public List<PostResponse> getPersonalizedFeed() {
       User currentUser = getCurrentUser();

        List<User> followedUsers = subscriptionRepository.findUsersFollowedBy(currentUser);

        if (followedUsers.isEmpty()) {
            return new ArrayList<>();
        } 

        List<BlogPost> posts = postRepository.findByAuthorInOrderByCreatedAtDesc(followedUsers);

        return posts.stream()
                .map(post -> convertToPostResponse(post, currentUser))
                .collect(Collectors.toList());
    }

    private PostResponse convertToPostResponse(BlogPost post, User currentUser) {

        long likesCount = likeRepository.countByPost(post);
        boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);

        long commentsCount = commentRepository.countByPost(post);

        return new PostResponse(
            post.getId(), 
            post.getTitle(), 
            post.getContent(), 
            post.getMediaUrl(), 
            post.getMediaType(), 
            post.getAuthor().getId(),
            post.getAuthor().getUsername(),
            likesCount,      
            isLiked,         
            commentsCount,  
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }
}