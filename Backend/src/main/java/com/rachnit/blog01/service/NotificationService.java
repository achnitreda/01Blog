package com.rachnit.blog01.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rachnit.blog01.dto.response.NotificationResponse;
import com.rachnit.blog01.dto.response.NotificationSummaryResponse;
import com.rachnit.blog01.entity.Notification;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.NotificationRepository;
import com.rachnit.blog01.repository.UserRepository;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get unread notifications for current user
     */
    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(currentUser);
        
        return notifications.stream()
                .map(this::convertToNotificationResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get unread count for notification badge
     */
    public NotificationSummaryResponse getNotificationSummary() {
        User currentUser = getCurrentUser();
        long unreadCount = notificationRepository.countByRecipientAndReadFalse(currentUser);
        
        return new NotificationSummaryResponse(unreadCount);
    }

    /**
     * Mark a notification as read
     */
    public NotificationResponse markAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Verify ownership
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to access this notification");
        }
        
        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        
        return convertToNotificationResponse(updatedNotification);
    }

    /**
     * Convert Notification entity to NotificationResponse DTO
     */
    private NotificationResponse convertToNotificationResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getMessage(),
            notification.getType(),
            notification.isRead(),
            notification.getActor().getId(),
            notification.getActor().getUsername(),
            notification.getPost().getId(),
            notification.getPost().getTitle(),
            notification.getCreatedAt()
        );
    }
}