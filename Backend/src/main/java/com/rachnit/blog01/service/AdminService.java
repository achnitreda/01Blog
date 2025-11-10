package com.rachnit.blog01.service;

import com.rachnit.blog01.dto.response.AdminPostResponse;
import com.rachnit.blog01.dto.response.AdminUserResponse;
import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.enums.Role;
import com.rachnit.blog01.repository.CommentRepository;
import com.rachnit.blog01.repository.LikeRepository;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.ReportRepository;
import com.rachnit.blog01.repository.SubscriptionRepository;
import com.rachnit.blog01.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    /**
     * Get current authenticated user and verify admin role
     */
    private User getCurrentAdmin() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify admin role
        if (!user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Admin access required");
        }

        return user;
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    /**
     * Get all users in the system
     */
    public List<AdminUserResponse> getAllUsers() {
        getCurrentAdmin(); // Verify admin access

        List<User> users = userRepository.findAll();

        return users
            .stream()
            .map(this::convertToAdminUserResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get specific user details
     */
    public AdminUserResponse getUserById(Long userId) {
        getCurrentAdmin();

        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return convertToAdminUserResponse(user);
    }

    /**
     * Ban a user
     */
    public AdminUserResponse banUser(Long userId, String reason) {
        getCurrentAdmin();

        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent banning admins
        if (user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Cannot ban admin users");
        }

        // Check if already banned
        if (user.isBanned()) {
            throw new RuntimeException("User is already banned");
        }

        // Ban the user
        user.setBanned(true);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);

        return convertToAdminUserResponse(updatedUser);
    }

    /**
     * Unban a user
     */
    public AdminUserResponse unbanUser(Long userId) {
        getCurrentAdmin();

        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is banned
        if (!user.isBanned()) {
            throw new RuntimeException("User is not banned");
        }

        // Unban the user
        user.setBanned(false);
        user.setBanReason(null);
        user.setBannedAt(null);

        User updatedUser = userRepository.save(user);

        return convertToAdminUserResponse(updatedUser);
    }

    /**
     * Delete a user completely
     */
    public Map<String, String> deleteUser(Long userId) {
        getCurrentAdmin();

        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent deleting admins
        if (user.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("Cannot delete admin users");
        }

        String username = user.getUsername();

        // Delete user (cascade will handle related data)
        userRepository.delete(user);

        Map<String, String> response = new HashMap<>();
        response.put(
            "message",
            "User '" + username + "' has been permanently deleted"
        );

        return response;
    }

    // ============================================
    // POST MANAGEMENT
    // ============================================

    /**
     * Get all posts in the system
     */
    public List<AdminPostResponse> getAllPosts() {
        getCurrentAdmin();

        List<BlogPost> posts = postRepository.findAllByOrderByCreatedAtDesc();

        return posts
            .stream()
            .map(this::convertToAdminPostResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get specific post details
     */
    public AdminPostResponse getPostById(Long postId) {
        getCurrentAdmin();

        BlogPost post = postRepository
            .findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        return convertToAdminPostResponse(post);
    }

    /**
     * Hide a post (soft delete - post remains in DB but not visible to users)
     */
    public AdminPostResponse hidePost(Long postId, String reason) {
        getCurrentAdmin();

        BlogPost post = postRepository
            .findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already hidden
        if (post.isHidden()) {
            throw new RuntimeException("Post is already hidden");
        }

        // Hide the post
        post.setHidden(true);
        post.setHiddenReason(reason);
        post.setHiddenAt(LocalDateTime.now());

        BlogPost updatedPost = postRepository.save(post);

        return convertToAdminPostResponse(updatedPost);
    }

    /**
     * Unhide a post
     */
    public AdminPostResponse unhidePost(Long postId) {
        getCurrentAdmin();

        BlogPost post = postRepository
            .findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if post is hidden
        if (!post.isHidden()) {
            throw new RuntimeException("Post is not hidden");
        }

        // Unhide the post
        post.setHidden(false);
        post.setHiddenReason(null);
        post.setHiddenAt(null);

        BlogPost updatedPost = postRepository.save(post);

        return convertToAdminPostResponse(updatedPost);
    }

    /**
     * Delete a post permanently
     */
    public Map<String, String> deletePost(Long postId) {
        getCurrentAdmin();

        BlogPost post = postRepository
            .findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        String postTitle = post.getTitle();

        // Delete post (cascade will handle comments, likes, notifications)
        postRepository.delete(post);

        Map<String, String> response = new HashMap<>();
        response.put(
            "message",
            "Post '" + postTitle + "' has been permanently deleted"
        );

        return response;
    }

    // ============================================
    // STATISTICS & DASHBOARD
    // ============================================

    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        getCurrentAdmin();

        Map<String, Object> stats = new HashMap<>();

        // User statistics
        long totalUsers = userRepository.count();
        long bannedUsers = userRepository.countByBanned(true);
        long activeUsers = totalUsers - bannedUsers;

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("bannedUsers", bannedUsers);

        // Post statistics
        long totalPosts = postRepository.count();
        long hiddenPosts = postRepository.countByHidden(true);
        long visiblePosts = totalPosts - hiddenPosts;

        stats.put("totalPosts", totalPosts);
        stats.put("visiblePosts", visiblePosts);
        stats.put("hiddenPosts", hiddenPosts);

        // Report statistics
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("PENDING");
        long resolvedReports = reportRepository.countByStatus("RESOLVED");

        stats.put("totalReports", totalReports);
        stats.put("pendingReports", pendingReports);
        stats.put("resolvedReports", resolvedReports);

        return stats;
    }

    // ============================================
    // CONVERSION METHODS
    // ============================================

    /**
     * Convert User entity to AdminUserResponse DTO
     */
    private AdminUserResponse convertToAdminUserResponse(User user) {
        long postsCount = postRepository.countByAuthor(user);
        long followersCount = subscriptionRepository.countByFollowing(user);
        long followingCount = subscriptionRepository.countByFollower(user);
        long reportsCount = reportRepository.countByReportedUser(user);

        return new AdminUserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.isBanned(),
            user.getBanReason(),
            user.getBannedAt(),
            postsCount,
            followersCount,
            followingCount,
            reportsCount,
            user.getCreatedAt()
        );
    }

    /**
     * Convert BlogPost entity to AdminPostResponse DTO
     */
    private AdminPostResponse convertToAdminPostResponse(BlogPost post) {
        long likesCount = likeRepository.countByPost(post);
        long commentsCount = commentRepository.countByPost(post);

        return new AdminPostResponse(
            post.getId(),
            post.getTitle(),
            post.getContent(),
            post.getMediaUrl(),
            post.getMediaType(),
            post.getAuthor().getId(),
            post.getAuthor().getUsername(),
            post.getAuthor().isBanned(),
            likesCount,
            commentsCount,
            post.isHidden(),
            post.getHiddenReason(),
            post.getHiddenAt(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }
}
