package com.rachnit.blog01.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class NotificationResponse {
    
    private Long id;
    private String message;
    private String type;
    private boolean read;
    
    // Actor information (who triggered the notification)
    private Long actorId;
    private String actorUsername;
    
    // Post information
    private Long postId;
    private String postTitle;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Constructors
    public NotificationResponse() {}
    
    public NotificationResponse(Long id, String message, String type, boolean read,
                               Long actorId, String actorUsername, Long postId, String postTitle,
                               LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.read = read;
        this.actorId = actorId;
        this.actorUsername = actorUsername;
        this.postId = postId;
        this.postTitle = postTitle;
        this.createdAt = createdAt;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    
    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }
    
    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    
    public String getPostTitle() { return postTitle; }
    public void setPostTitle(String postTitle) { this.postTitle = postTitle; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}