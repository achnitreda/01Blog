package com.rachnit.blog01.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rachnit.blog01.dto.request.CreateReportRequest;
import com.rachnit.blog01.dto.response.ReportResponse;
import com.rachnit.blog01.entity.Report;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.ReportRepository;
import com.rachnit.blog01.repository.UserRepository;


@Service
@Transactional
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

     /**
     * Submit a report against another user (any authenticated user can do this)
     */
    public Map<String, Object> submitReport(Long reportedUserId, CreateReportRequest request) {
        User reporter = getCurrentUser();
        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("Reported user not found"));
        
        // Prevent self-reporting
        if (reporter.getId().equals(reportedUser.getId())) {
            throw new RuntimeException("You cannot report yourself");
        }
        
        // Check if user already has a pending report against this user
        if (reportRepository.existsByReporterAndReportedUserAndStatus(reporter, reportedUser, "PENDING")) {
            throw new RuntimeException("You already have a pending report against this user");
        }
        
        // Create the report
        Report report = new Report(request.getReason(), reporter, reportedUser);
        Report savedReport = reportRepository.save(report);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Report submitted successfully. Our team will review it shortly.");
        response.put("reportId", savedReport.getId());
        
        return response;
    }

    /**
     * Get all reports (admin only - will be enforced by controller)
     */
    public List<ReportResponse> getAllReports() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        
        return reports.stream()
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get reports by status (admin only)
     */
    public List<ReportResponse> getReportsByStatus(String status) {
        // Validate status
        if (!status.equals("PENDING") && !status.equals("RESOLVED") && !status.equals("DISMISSED")) {
            throw new RuntimeException("Invalid status. Must be PENDING, RESOLVED, or DISMISSED");
        }
        
        List<Report> reports = reportRepository.findByStatusOrderByCreatedAtDesc(status);
        
        return reports.stream()
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get specific report by ID (admin only)
     */
    public ReportResponse getReportById(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        return convertToReportResponse(report);
    }

    /**
     * Get all reports against a specific user (admin only)
     */
    public List<ReportResponse> getReportsForUser(Long userId) {
        User reportedUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Report> reports = reportRepository.findByReportedUserOrderByCreatedAtDesc(reportedUser);
        
        return reports.stream()
                .map(this::convertToReportResponse)
                .collect(Collectors.toList());
    }

    /**
     * Resolve a report (admin only)
     */
    public ReportResponse resolveReport(Long reportId, String action) {
        User currentAdmin = getCurrentUser();
        
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        // Check if already resolved
        if (!report.getStatus().equals("PENDING")) {
            throw new RuntimeException("This report has already been " + report.getStatus().toLowerCase());
        }
        
        // Validate action
        if (!action.equals("RESOLVED") && !action.equals("DISMISSED")) {
            throw new RuntimeException("Invalid action. Must be RESOLVED or DISMISSED");
        }
        
        // Update report status
        report.setStatus(action);
        report.setResolvedBy(currentAdmin);
        report.setResolvedAt(LocalDateTime.now());
        
        Report updatedReport = reportRepository.save(report);
        
        return convertToReportResponse(updatedReport);
    }

    /**
     * Get report statistics (admin dashboard)
     */
    public Map<String, Long> getReportStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("totalReports", reportRepository.count());
        stats.put("pendingReports", reportRepository.countByStatus("PENDING"));
        stats.put("resolvedReports", reportRepository.countByStatus("RESOLVED"));
        stats.put("dismissedReports", reportRepository.countByStatus("DISMISSED"));
        
        return stats;
    }

     /**
     * Convert Report entity to ReportResponse DTO
     */
    private ReportResponse convertToReportResponse(Report report) {
        Long resolvedById = null;
        String resolvedByUsername = null;
        
        if (report.getResolvedBy() != null) {
            resolvedById = report.getResolvedBy().getId();
            resolvedByUsername = report.getResolvedBy().getUsername();
        }
        
        return new ReportResponse(
            report.getId(),
            report.getReason(),
            report.getStatus(),
            report.getReporter().getId(),
            report.getReporter().getUsername(),
            report.getReportedUser().getId(),
            report.getReportedUser().getUsername(),
            report.getReportedUser().isBanned(),
            resolvedById,
            resolvedByUsername,
            report.getCreatedAt(),
            report.getResolvedAt()
        );
    }
}