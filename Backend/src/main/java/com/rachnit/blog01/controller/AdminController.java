package com.rachnit.blog01.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.response.AdminPostResponse;
import com.rachnit.blog01.dto.response.AdminUserResponse;
import com.rachnit.blog01.dto.response.ReportResponse;
import com.rachnit.blog01.service.AdminService;
import com.rachnit.blog01.service.ReportService;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ReportService reportService;

    // ============================================
    // USER MANAGEMENT ENDPOINTS
    // ============================================   

     /**
     * Get all users in the system
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get specific user details
    */
    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long userId) {
        AdminUserResponse user = adminService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Ban a user
     */
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<AdminUserResponse> banUser(@PathVariable Long userId,
                                                     @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Ban reason is required");
        }
        
        AdminUserResponse user = adminService.banUser(userId, reason);
        return ResponseEntity.ok(user);
    }

    /**
     * Unban a user
     */
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<AdminUserResponse> unbanUser(@PathVariable Long userId) {
        AdminUserResponse user = adminService.unbanUser(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete a user permanently
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        Map<String, String> response = adminService.deleteUser(userId);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // POST MANAGEMENT ENDPOINTS
    // ============================================

    /**
     * Get all posts in the system
     */
    @GetMapping("/posts")
    public ResponseEntity<List<AdminPostResponse>> getAllPosts() {
        List<AdminPostResponse> posts = adminService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    /**
     * Get specific post details
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<AdminPostResponse> getPostById(@PathVariable Long postId) {
        AdminPostResponse post = adminService.getPostById(postId);
        return ResponseEntity.ok(post);
    }
    
    /**
     * Hide a post
     */
    @PutMapping("/posts/{postId}/hide")
    public ResponseEntity<AdminPostResponse> hidePost(@PathVariable Long postId,
                                                      @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Hide reason is required");
        }
        
        AdminPostResponse post = adminService.hidePost(postId, reason);
        return ResponseEntity.ok(post);
    }

    /**
     * Unhide a post
     */
    @PutMapping("/posts/{postId}/unhide")
    public ResponseEntity<AdminPostResponse> unhidePost(@PathVariable Long postId) {
        AdminPostResponse post = adminService.unhidePost(postId);
        return ResponseEntity.ok(post);
    }
    
    /**
     * Delete a post permanently
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long postId) {
        Map<String, String> response = adminService.deletePost(postId);
        return ResponseEntity.ok(response);
    }

    // ============================================
    // REPORT MANAGEMENT ENDPOINTS
    // ============================================
    
    /**
     * Get all reports
     */
    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    /**
     * Get reports by status (PENDING, RESOLVED, DISMISSED)
     */
    @GetMapping("/reports/status/{status}")
    public ResponseEntity<List<ReportResponse>> getReportsByStatus(@PathVariable String status) {
        List<ReportResponse> reports = reportService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }

     /**
     * Get specific report details
     */
    @GetMapping("/reports/{reportId}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long reportId) {
        ReportResponse report = reportService.getReportById(reportId);
        return ResponseEntity.ok(report);
    }

    /**
     * Get all reports for a specific user
     */
    @GetMapping("/reports/user/{userId}")
    public ResponseEntity<List<ReportResponse>> getReportsForUser(@PathVariable Long userId) {
        List<ReportResponse> reports = reportService.getReportsForUser(userId);
        return ResponseEntity.ok(reports);
    }
    
    /**
     * Resolve a report (mark as RESOLVED or DISMISSED)
     */
    @PutMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(@PathVariable Long reportId,
                                                        @RequestBody Map<String, String> request) {
        String action = request.get("action");
        if (action == null || action.trim().isEmpty()) {
            throw new RuntimeException("Action is required (RESOLVED or DISMISSED)");
        }
        
        ReportResponse report = reportService.resolveReport(reportId, action);
        return ResponseEntity.ok(report);
    }
    
     /**
     * Get report statistics
     */
    @GetMapping("/reports/statistics")
    public ResponseEntity<Map<String, Long>> getReportStatistics() {
        Map<String, Long> stats = reportService.getReportStatistics();
        return ResponseEntity.ok(stats);
    }

    // ============================================
    // DASHBOARD & STATISTICS
    // ============================================
    
    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard/statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> stats = adminService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }
}