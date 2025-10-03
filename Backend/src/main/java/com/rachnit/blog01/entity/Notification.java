package com.rachnit.blog01.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // for future notifs: NEW_POST", "NEW_COMMENT", etc.

    @Column(nullable = false)
    private boolean read = false;

    // User who receives the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // User who triggered the notification (post author)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    // Related post (cascade delete when post is deleted)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private BlogPost post;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Notification() {}
    
    public Notification(String message, String type, User recipient, User actor, BlogPost post) {
        this.message = message;
        this.type = type;
        this.recipient = recipient;
        this.actor = actor;
        this.post = post;
        this.read = false;
        this.createdAt = LocalDateTime.now();
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
    
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    
    public BlogPost getPost() { return post; }
    public void setPost(BlogPost post) { this.post = post; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}