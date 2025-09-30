package com.rachnit.blog01.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class CommentResponse {

    private Long id;
    private String content;
    
    // Author information
    private Long authorId;
    private String authorUsername;
    
    // Post information
    private Long postId;

    private boolean isOwner;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    // Constructors
    public CommentResponse() {}
    
    public CommentResponse(Long id, String content, Long authorId, String authorUsername,
                          Long postId,boolean isOwner, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.postId = postId;
        this.isOwner = isOwner;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public boolean isOwner() { return isOwner; }
    public void setOwner(boolean owner) { isOwner = owner; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}