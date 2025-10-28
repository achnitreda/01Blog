package com.rachnit.blog01.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class LikeResponse {

    private String message;

    @JsonProperty("isLiked")
    private boolean isLiked;

    private long likesCount;
    private Long postId;
    private String postTitle;

    @JsonFormat(
        shape = JsonFormat.Shape.STRING,
        pattern = "yyyy-MM-dd'T'HH:mm:ss"
    )
    private LocalDateTime timestamp;

    // Constructors
    public LikeResponse() {}

    public LikeResponse(
        String message,
        boolean isLiked,
        long likesCount,
        Long postId,
        String postTitle
    ) {
        this.message = message;
        this.isLiked = isLiked;
        this.likesCount = likesCount;
        this.postId = postId;
        this.postTitle = postTitle;
        this.timestamp = LocalDateTime.now();
    }

    // Static factory methods
    public static LikeResponse likeSuccess(
        long likesCount,
        Long postId,
        String postTitle
    ) {
        return new LikeResponse(
            "Post liked successfully",
            true,
            likesCount,
            postId,
            postTitle
        );
    }

    public static LikeResponse unlikeSuccess(
        long likesCount,
        Long postId,
        String postTitle
    ) {
        return new LikeResponse(
            "Post unliked successfully",
            false,
            likesCount,
            postId,
            postTitle
        );
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public long getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(long likesCount) {
        this.likesCount = likesCount;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getPostTitle() {
        return postTitle;
    }

    public void setPostTitle(String postTitle) {
        this.postTitle = postTitle;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
