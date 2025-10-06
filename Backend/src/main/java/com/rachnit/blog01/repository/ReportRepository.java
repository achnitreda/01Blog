package com.rachnit.blog01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.Report;
import com.rachnit.blog01.entity.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    /**
     * Get all reports (admin view)
     */
    List<Report> findAllByOrderByCreatedAtDesc();

    /**
     * Get reports by status (for filtering)
     */
    List<Report> findByStatusOrderByCreatedAtDesc(String status);

     /**
     * Get all reports against a specific user
     */
    List<Report> findByReportedUserOrderByCreatedAtDesc(User reportedUser);

    /**
     * Check if user already reported another user (prevent duplicate reports)
     */
    boolean existsByReporterAndReportedUserAndStatus(User reporter, User reportedUser, String status);

    /**
     * Count pending reports
     */
    long countByStatus(String status);

     /**
     * Count reports against a specific user
     */
    long countByReportedUser(User reportedUser);
}