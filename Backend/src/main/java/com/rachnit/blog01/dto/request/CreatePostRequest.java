package com.rachnit.blog01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s.,!?'-]+$", message = "Title can only contain letters, numbers, spaces, and basic punctuation")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 10000, message = "Content must be between 10 and 10000 characters")
    @Pattern(regexp = "^[^<>\"']*$", message = "Content cannot contain HTML tags or script characters")
    private String content;

    @NotBlank(message = "Media URL is required")
    @Size(max = 1000, message = "Media URL must not exceed 1000 characters")
    @Pattern(regexp = "^https?://.*\\.(jpg|jpeg|png|gif|mp4|mov|avi)$", message = "Must be a valid image or video URL")
    private String mediaUrl;

    @NotBlank(message = "Media type is required")
    @Pattern(regexp = "^(image|video)$", message = "Media type must be either 'image' or 'video'")
    private String mediaType;

    // Constructors
     public CreatePostRequest() {}
    
    public CreatePostRequest(String title, String content, String mediaUrl, String mediaType) {
        this.title = title;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
    }

    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
}