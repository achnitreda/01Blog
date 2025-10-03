package com.rachnit.blog01.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.Notification;
import com.rachnit.blog01.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Get unread notifications for a user
     */
    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);
    
    /**
     * Count unread notifications for a user
     */
    long countByRecipientAndReadFalse(User recipient);
}