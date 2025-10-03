package com.rachnit.blog01.dto.response;

public class NotificationSummaryResponse {
    
    private long unreadCount;
    
    // Constructors
    public NotificationSummaryResponse() {}
    
    public NotificationSummaryResponse(long unreadCount) {
        this.unreadCount = unreadCount;
    }
    
    // Getters and setters
    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}
