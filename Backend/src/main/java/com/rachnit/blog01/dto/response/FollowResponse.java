package com.rachnit.blog01.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class FollowResponse {

    private String message;

    @JsonProperty("isFollowing")
    private boolean isFollowing;

    private Long followerId;
    private String followerUsername;
    private Long followingId;
    private String followingUsername;

    @JsonFormat(
        shape = JsonFormat.Shape.STRING,
        pattern = "yyyy-MM-dd'T'HH:mm:ss"
    )
    private LocalDateTime timestamp;

    // Constructors
    public FollowResponse() {}

    public FollowResponse(
        String message,
        boolean isFollowing,
        Long followerId,
        String followerUsername,
        Long followingId,
        String followingUsername
    ) {
        this.message = message;
        this.isFollowing = isFollowing;
        this.followerId = followerId;
        this.followerUsername = followerUsername;
        this.followingId = followingId;
        this.followingUsername = followingUsername;
        this.timestamp = LocalDateTime.now();
    }

    // Static factory methods for common responses
    public static FollowResponse followSuccess(
        Long followerId,
        String followerUsername,
        Long followingId,
        String followingUsername
    ) {
        return new FollowResponse(
            "You are now following @" + followingUsername,
            true,
            followerId,
            followerUsername,
            followingId,
            followingUsername
        );
    }

    public static FollowResponse unfollowSuccess(
        Long followerId,
        String followerUsername,
        Long followingId,
        String followingUsername
    ) {
        return new FollowResponse(
            "You have unfollowed @" + followingUsername,
            false,
            followerId,
            followerUsername,
            followingId,
            followingUsername
        );
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isFollowing() {
        return isFollowing;
    }

    public void setFollowing(boolean following) {
        isFollowing = following;
    }

    public Long getFollowerId() {
        return followerId;
    }

    public void setFollowerId(Long followerId) {
        this.followerId = followerId;
    }

    public String getFollowerUsername() {
        return followerUsername;
    }

    public void setFollowerUsername(String followerUsername) {
        this.followerUsername = followerUsername;
    }

    public Long getFollowingId() {
        return followingId;
    }

    public void setFollowingId(Long followingId) {
        this.followingId = followingId;
    }

    public String getFollowingUsername() {
        return followingUsername;
    }

    public void setFollowingUsername(String followingUsername) {
        this.followingUsername = followingUsername;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
