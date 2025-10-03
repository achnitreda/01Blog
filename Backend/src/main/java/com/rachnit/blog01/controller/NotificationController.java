package com.rachnit.blog01.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rachnit.blog01.dto.response.NotificationResponse;
import com.rachnit.blog01.dto.response.NotificationSummaryResponse;
import com.rachnit.blog01.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get unread notifications for current user
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        List<NotificationResponse> notifications = notificationService.getMyNotifications();
        return ResponseEntity.ok(notifications);
    }

     /**
     * Get unread count for notification badge
     */
    @GetMapping("/summary")
    public ResponseEntity<NotificationSummaryResponse> getNotificationSummary() {
        NotificationSummaryResponse summary = notificationService.getNotificationSummary();
        return ResponseEntity.ok(summary);
    }

     /**
     * Mark a notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long notificationId) {
        NotificationResponse notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(notification);
    }
}
