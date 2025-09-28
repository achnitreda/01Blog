package com.rachnit.blog01.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rachnit.blog01.enums.Role;

public class UserProfileResponse {

    private Long userId;
    private String username;
    private String email;  // Only shown if viewing own profile
    private Role role;

    // Social stats
    private long followersCount;
    private long followingCount;
    private long postsCount;

    // Follow relationship status (for current user viewing this profile)
    private boolean isFollowing;
    private boolean isOwnProfile;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;

    // Constructors
    public UserProfileResponse() {}

    public UserProfileResponse(Long userId, String username, String email, Role role,
                              long followersCount, long followingCount, long postsCount,
                              boolean isFollowing, boolean isOwnProfile, LocalDateTime joinedAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.postsCount = postsCount;
        this.isFollowing = isFollowing;
        this.isOwnProfile = isOwnProfile;
        this.joinedAt = joinedAt;
    }

    // Getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public long getFollowersCount() { return followersCount; }
    public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }
    
    public long getFollowingCount() { return followingCount; }
    public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }
    
    public long getPostsCount() { return postsCount; }
    public void setPostsCount(long postsCount) { this.postsCount = postsCount; }
    
    public boolean isFollowing() { return isFollowing; }
    public void setFollowing(boolean following) { isFollowing = following; }
    
    public boolean isOwnProfile() { return isOwnProfile; }
    public void setOwnProfile(boolean ownProfile) { isOwnProfile = ownProfile; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}