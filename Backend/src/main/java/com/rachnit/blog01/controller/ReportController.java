package com.rachnit.blog01.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.request.CreateReportRequest;
import com.rachnit.blog01.service.ReportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @Autowired
    private ReportService reportService;
    
    /**
     * Submit a report against another user
     * Any authenticated user can report another user
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> reportUser(@PathVariable Long userId,
                                                          @Valid @RequestBody CreateReportRequest request) {
        Map<String, Object> response = reportService.submitReport(userId, request);
        return ResponseEntity.ok(response);
    }
}