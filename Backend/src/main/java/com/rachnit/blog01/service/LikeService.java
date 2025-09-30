package com.rachnit.blog01.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rachnit.blog01.dto.response.LikeResponse;
import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.Like;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.LikeRepository;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

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
     * Like a post
     */
    public LikeResponse likePost(Long postId) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already liked
        if (likeRepository.existsByUserAndPost(currentUser, post)) {
            throw new RuntimeException("You have already liked this post");
        }

        // Create new like
        Like like = new Like(currentUser, post);
        likeRepository.save(like);

        // Get updated likes count
        long likesCount = likeRepository.countByPost(post);

        return LikeResponse.likeSuccess(likesCount, post.getId(), post.getTitle());
    }


    /**
     * Unlike a post
    */
    public LikeResponse unlikePost(Long postId) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if currently liked
        Optional<Like> like = likeRepository.findByUserAndPost(currentUser, post);
        if (like.isEmpty()) {
            throw new RuntimeException("You have not liked this post");
        }

        // Remove like
        likeRepository.delete(like.get());

        // Get updated likes count
        long likesCount = likeRepository.countByPost(post);

        return LikeResponse.unlikeSuccess(likesCount, post.getId(), post.getTitle());
    }

    /**
     * Check if current user has liked a post
     */
    public boolean hasUserLikedPost(Long postId) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return likeRepository.existsByUserAndPost(currentUser, post);
    }

    /**
     * Get likes count for a post
     */
    public long getLikesCount(Long postId) {
        BlogPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return likeRepository.countByPost(post);
    }
}  