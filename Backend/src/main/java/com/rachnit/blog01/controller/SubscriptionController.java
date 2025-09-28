package com.rachnit.blog01.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.response.FollowResponse;
import com.rachnit.blog01.dto.response.UserProfileResponse;
import com.rachnit.blog01.service.SubscriptionService;

@RestController
@RequestMapping("/api/users")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    /**
     * Follow a user
     */
    @PostMapping("/{userId}/follow")
    public ResponseEntity<FollowResponse> followUser(@PathVariable Long userId) {
        FollowResponse response = subscriptionService.followUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Unfollow a user
     */
    @DeleteMapping("/{userId}/unfollow")
    public ResponseEntity<FollowResponse> unfollowUser(@PathVariable Long userId) {
        FollowResponse response = subscriptionService.unfollowUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user profile with social stats
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        UserProfileResponse profile = subscriptionService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Get current user's profile
     */
    @GetMapping("/my-profile")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        UserProfileResponse profile = subscriptionService.getMyProfile();
        return ResponseEntity.ok(profile);
    }
}