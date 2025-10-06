package com.rachnit.blog01.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class ReportResponse {
    
    private Long id;
    private String reason;
    private String status;
    
    // Reporter information
    private Long reporterId;
    private String reporterUsername;
    
    // Reported user information
    private Long reportedUserId;
    private String reportedUsername;
    private boolean reportedUserBanned;
    
    // Resolution information (if resolved)
    private Long resolvedById;
    private String resolvedByUsername;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime resolvedAt;
    
    // Constructors
    public ReportResponse() {}
    
    public ReportResponse(Long id, String reason, String status,
                         Long reporterId, String reporterUsername,
                         Long reportedUserId, String reportedUsername, boolean reportedUserBanned,
                         Long resolvedById, String resolvedByUsername,
                         LocalDateTime createdAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.reason = reason;
        this.status = status;
        this.reporterId = reporterId;
        this.reporterUsername = reporterUsername;
        this.reportedUserId = reportedUserId;
        this.reportedUsername = reportedUsername;
        this.reportedUserBanned = reportedUserBanned;
        this.resolvedById = resolvedById;
        this.resolvedByUsername = resolvedByUsername;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    
    public String getReporterUsername() { return reporterUsername; }
    public void setReporterUsername(String reporterUsername) { this.reporterUsername = reporterUsername; }
    
    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }
    
    public String getReportedUsername() { return reportedUsername; }
    public void setReportedUsername(String reportedUsername) { this.reportedUsername = reportedUsername; }
    
    public boolean isReportedUserBanned() { return reportedUserBanned; }
    public void setReportedUserBanned(boolean reportedUserBanned) { this.reportedUserBanned = reportedUserBanned; }
    
    public Long getResolvedById() { return resolvedById; }
    public void setResolvedById(Long resolvedById) { this.resolvedById = resolvedById; }
    
    public String getResolvedByUsername() { return resolvedByUsername; }
    public void setResolvedByUsername(String resolvedByUsername) { this.resolvedByUsername = resolvedByUsername; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
