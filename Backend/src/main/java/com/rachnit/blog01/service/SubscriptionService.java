package com.rachnit.blog01.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rachnit.blog01.dto.response.FollowResponse;
import com.rachnit.blog01.dto.response.UserProfileResponse;
import com.rachnit.blog01.entity.Subscription;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.SubscriptionRepository;
import com.rachnit.blog01.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

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
     * Follow a user
     */
    public FollowResponse followUser(Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
        // Prevent self-following
        if (currentUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        // Check if already following
        if (subscriptionRepository.existsByFollowerAndFollowing(currentUser, targetUser)) {
            throw new RuntimeException("You are already following @" + targetUser.getUsername());
        }

        // Create new subscription
        Subscription subscription = new Subscription(currentUser, targetUser);
        subscriptionRepository.save(subscription);

        return FollowResponse.followSuccess(
            currentUser.getId(),
            currentUser.getUsername(),
            targetUser.getId(),
            targetUser.getUsername()
        );
    }

    /**
     * Unfollow a user
    */
    public FollowResponse unfollowUser(Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if currently following
        Optional<Subscription> subscription = subscriptionRepository.findByFollowerAndFollowing(currentUser, targetUser);
        if (subscription.isEmpty()) {
            throw new RuntimeException("You are not following @" + targetUser.getUsername());
        }

        // Remove subscription
        subscriptionRepository.delete(subscription.get());

        return FollowResponse.unfollowSuccess(
            currentUser.getId(),
            currentUser.getUsername(),
            targetUser.getId(),
            targetUser.getUsername()
        );
    }

    /**
     * Get user profile with social stats
    */
   public UserProfileResponse getUserProfile(Long userId) {
        User currentUser = getCurrentUser();
        User profileUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        
        // Calculate social stats
        long followersCount = subscriptionRepository.countByFollowing(profileUser);
        long followingCount = subscriptionRepository.countByFollower(profileUser);
        long postsCount = postRepository.countByAuthor(profileUser);


        // Check if current user is following this profile
        boolean isFollowing = subscriptionRepository.existsByFollowerAndFollowing(currentUser, profileUser);
        
        // Check if viewing own profile
        boolean isOwnProfile = currentUser.getId().equals(profileUser.getId());

        return new UserProfileResponse(
            profileUser.getId(),
            profileUser.getUsername(),
            isOwnProfile ? profileUser.getEmail() : null, // Only show email on own profile
            profileUser.getRole(),
            followersCount,
            followingCount,
            postsCount,
            isFollowing,
            isOwnProfile,
            profileUser.getCreatedAt()
        );
   }

    /**
     * Check if current user is following a specific user
     */
    public boolean isFollowing(Long userId) {
        User currentUser = getCurrentUser();
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return subscriptionRepository.existsByFollowerAndFollowing(currentUser, targetUser);
    }

    /**
     * Get current user's profile (convenience method)
     */
    public UserProfileResponse getMyProfile() {
        User currentUser = getCurrentUser();
        return getUserProfile(currentUser.getId());
    }
}
