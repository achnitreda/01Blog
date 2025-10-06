package com.rachnit.blog01.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateReportRequest {
    
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    @Pattern(regexp = "^[^<>\"']*$", message = "Reason cannot contain HTML tags or script characters")
    private String reason;
    
    // Constructors
    public CreateReportRequest() {}
    
    public CreateReportRequest(String reason) {
        this.reason = reason;
    }
    
    // Getters and setters
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
