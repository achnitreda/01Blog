package com.rachnit.blog01.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class AdminPostResponse {
    
    private Long id;
    private String title;
    private String content;
    private String mediaUrl;
    private String mediaType;
    
    // Author information
    private Long authorId;
    private String authorUsername;
    private boolean authorBanned;
    
    // Social stats
    private long likesCount;
    private long commentsCount;
    
    // Hidden status
    private boolean hidden;
    private String hiddenReason;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime hiddenAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Constructors
    public AdminPostResponse() {}
    
    public AdminPostResponse(Long id, String title, String content, String mediaUrl, String mediaType,
                            Long authorId, String authorUsername, boolean authorBanned,
                            long likesCount, long commentsCount,
                            boolean hidden, String hiddenReason, LocalDateTime hiddenAt,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.authorId = authorId;
        this.authorUsername = authorUsername;
        this.authorBanned = authorBanned;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.hidden = hidden;
        this.hiddenReason = hiddenReason;
        this.hiddenAt = hiddenAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    
    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    
    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    
    public boolean isAuthorBanned() { return authorBanned; }
    public void setAuthorBanned(boolean authorBanned) { this.authorBanned = authorBanned; }
    
    public long getLikesCount() { return likesCount; }
    public void setLikesCount(long likesCount) { this.likesCount = likesCount; }
    
    public long getCommentsCount() { return commentsCount; }
    public void setCommentsCount(long commentsCount) { this.commentsCount = commentsCount; }
    
    public boolean isHidden() { return hidden; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
    
    public String getHiddenReason() { return hiddenReason; }
    public void setHiddenReason(String hiddenReason) { this.hiddenReason = hiddenReason; }
    
    public LocalDateTime getHiddenAt() { return hiddenAt; }
    public void setHiddenAt(LocalDateTime hiddenAt) { this.hiddenAt = hiddenAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
