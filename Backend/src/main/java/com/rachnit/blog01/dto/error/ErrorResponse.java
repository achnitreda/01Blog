package com.rachnit.blog01.dto.error;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;

public class ErrorResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private String path;
    private Map<String, Object> details;


    public ErrorResponse(int status, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.message = message;
        this.path = path;
    }

    public ErrorResponse(int status, String message, String path, Map<String, Object> details) {
        this(status, message, path);
        this.details = details;
    }

    // Getters only (immutable)
    public LocalDateTime getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
    public String getPath() { return path; }
    public Map<String, Object> getDetails() { return details; }
}