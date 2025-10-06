package com.rachnit.blog01.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rachnit.blog01.enums.Role;

public class AdminUserResponse {
    
    private Long userId;
    private String username;
    private String email;
    private Role role;
    
    // Ban status
    private boolean banned;
    private String banReason;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bannedAt;
    
    // Statistics
    private long postsCount;
    private long followersCount;
    private long followingCount;
    private long reportsCount; // How many reports against this user
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;
    
    // Constructors
    public AdminUserResponse() {}
    
    public AdminUserResponse(Long userId, String username, String email, Role role,
                            boolean banned, String banReason, LocalDateTime bannedAt,
                            long postsCount, long followersCount, long followingCount, long reportsCount,
                            LocalDateTime joinedAt) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.banned = banned;
        this.banReason = banReason;
        this.bannedAt = bannedAt;
        this.postsCount = postsCount;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.reportsCount = reportsCount;
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
    
    public boolean isBanned() { return banned; }
    public void setBanned(boolean banned) { this.banned = banned; }
    
    public String getBanReason() { return banReason; }
    public void setBanReason(String banReason) { this.banReason = banReason; }
    
    public LocalDateTime getBannedAt() { return bannedAt; }
    public void setBannedAt(LocalDateTime bannedAt) { this.bannedAt = bannedAt; }
    
    public long getPostsCount() { return postsCount; }
    public void setPostsCount(long postsCount) { this.postsCount = postsCount; }
    
    public long getFollowersCount() { return followersCount; }
    public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }
    
    public long getFollowingCount() { return followingCount; }
    public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }
    
    public long getReportsCount() { return reportsCount; }
    public void setReportsCount(long reportsCount) { this.reportsCount = reportsCount; }
    
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
