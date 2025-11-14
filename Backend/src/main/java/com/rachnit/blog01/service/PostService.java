package com.rachnit.blog01.service;

import com.rachnit.blog01.dto.request.CreatePostRequest;
import com.rachnit.blog01.dto.request.UpdatePostRequest;
import com.rachnit.blog01.dto.response.PostResponse;
import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.Notification;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.CommentRepository;
import com.rachnit.blog01.repository.LikeRepository;
import com.rachnit.blog01.repository.NotificationRepository;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.SubscriptionRepository;
import com.rachnit.blog01.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
/**
 * Keeps Hibernate session open during entire method execution
 * Allows lazy relationships to load when accessed
 */
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Get current authenticated user
     */
    private User getCurrentUser() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PostResponse createPost(CreatePostRequest request) {
        User currentUser = getCurrentUser();

        BlogPost post = new BlogPost(
            request.getTitle(),
            request.getContent(),
            request.getMediaUrl(),
            request.getMediaType(),
            currentUser
        );

        BlogPost savedPost = postRepository.save(post);

        // Generate notifications for all followers
        createNotificationsForFollowers(savedPost, currentUser);

        return convertToPostResponse(savedPost, currentUser);
    }

    /**
     * Create post with file upload (Multipart request)
     */
    public PostResponse createPostWithFile(
        String title,
        String content,
        MultipartFile media
    ) {
        User currentUser = getCurrentUser();

        String mediaUrl = null;
        String mediaType = null;

        // If media file is provided, upload to Cloudinary
        if (media != null && !media.isEmpty()) {
            try {
                mediaUrl = cloudinaryService.uploadMedia(media);

                String contentType = media.getContentType();
                if (contentType != null) {
                    if (contentType.startsWith("image/")) {
                        mediaType = "image";
                    } else if (contentType.startsWith("video/")) {
                        mediaType = "video";
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException(
                    "Failed to upload media: " + e.getMessage(),
                    e
                );
            }
        }

        // Create post
        BlogPost post = new BlogPost(
            title,
            content,
            mediaUrl,
            mediaType,
            currentUser
        );

        BlogPost savedPost = postRepository.save(post);

        createNotificationsForFollowers(savedPost, currentUser);

        return convertToPostResponse(savedPost, currentUser);
    }

    private void createNotificationsForFollowers(BlogPost post, User author) {
        // Find all users who follow this author
        List<User> followers = subscriptionRepository.findFollowersByFollowing(
            author
        );

        // Create a notification for each follower
        List<Notification> notifications = new ArrayList<>();
        for (User follower : followers) {
            String message = author.getUsername() + " published a new post";
            Notification notification = new Notification(
                message,
                "NEW_POST",
                follower, // recipient (the follower)
                author, // actor (the post author)
                post // the new post
            );
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    public PostResponse getPostById(Long postId) {
        User currentUser = getCurrentUser();
        BlogPost post = postRepository
            .findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.isHidden()) {
            throw new RuntimeException("Post not found");
        }

        return convertToPostResponse(post, currentUser);
    }

    public PostResponse updatePost(Long postId, UpdatePostRequest request) {
        User currentUser = getCurrentUser();

        // Verify ownership
        BlogPost post = postRepository
            .findByIdAndAuthor(postId, currentUser)
            .orElseThrow(() ->
                new RuntimeException(
                    "Post not found or you don't have permission to edit it"
                )
            );

        // Update only provided fields
        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMediaUrl() != null) {
            post.setMediaUrl(request.getMediaUrl());
        }
        if (request.getMediaType() != null) {
            post.setMediaType(request.getMediaType());
        }

        BlogPost updatedPost = postRepository.save(post);
        return convertToPostResponse(updatedPost, currentUser);
    }

    /**
     * Update post with file upload (Multipart request)
     */
    public PostResponse updatePostWithFile(
        Long postId,
        String title,
        String content,
        MultipartFile media
    ) {
        User currentUser = getCurrentUser();

        // Verify ownership
        BlogPost post = postRepository
            .findByIdAndAuthor(postId, currentUser)
            .orElseThrow(() ->
                new RuntimeException(
                    "Post not found or you don't have permission to edit it"
                )
            );

        if (title != null && !title.trim().isEmpty()) {
            post.setTitle(title);
        }

        if (content != null && !content.trim().isEmpty()) {
            post.setContent(content);
        }

        if (media != null && !media.isEmpty()) {
            try {
                // Optional: Delete old media from Cloudinary
                if (
                    post.getMediaUrl() != null &&
                    cloudinaryService.isCloudinaryUrl(post.getMediaUrl())
                ) {
                    String oldPublicId = cloudinaryService.extractPublicId(
                        post.getMediaUrl()
                    );
                    String oldResourceType =
                        cloudinaryService.getResourceTypeFromUrl(
                            post.getMediaUrl()
                        );
                    if (oldPublicId != null && oldResourceType != null) {
                        cloudinaryService.deleteMedia(
                            oldPublicId,
                            oldResourceType
                        );
                    }
                }

                // Upload new media
                String mediaUrl = cloudinaryService.uploadMedia(media);

                String mediaType = null;
                String contentType = media.getContentType();
                if (contentType != null) {
                    if (contentType.startsWith("image/")) {
                        mediaType = "image";
                    } else if (contentType.startsWith("video/")) {
                        mediaType = "video";
                    }
                }

                post.setMediaUrl(mediaUrl);
                post.setMediaType(mediaType);
            } catch (Exception e) {
                throw new RuntimeException(
                    "Failed to upload media: " + e.getMessage(),
                    e
                );
            }
        }

        // If neither media nor removeMedia, keep existing media unchanged
        BlogPost updatedPost = postRepository.save(post);
        return convertToPostResponse(updatedPost, currentUser);
    }

    public void deletePost(Long postId) {
        User currentUser = getCurrentUser();

        // Verify ownership
        BlogPost post = postRepository
            .findByIdAndAuthor(postId, currentUser)
            .orElseThrow(() ->
                new RuntimeException(
                    "Post not found or you don't have permission to delete it"
                )
            );

        // Delete media from Cloudinary before deleting post
        if (
            post.getMediaUrl() != null &&
            cloudinaryService.isCloudinaryUrl(post.getMediaUrl())
        ) {
            String publicId = cloudinaryService.extractPublicId(
                post.getMediaUrl()
            );
            String resourceType = cloudinaryService.getResourceTypeFromUrl(
                post.getMediaUrl()
            );
            if (publicId != null && resourceType != null) {
                cloudinaryService.deleteMedia(publicId, resourceType);
            }
        }

        postRepository.delete(post);
    }

    public List<PostResponse> getUserPosts(Long userId) {
        User currentUser = getCurrentUser();
        // Verify user exists
        userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<BlogPost> posts =
            postRepository.findByAuthor_IdOrderByCreatedAtDesc(userId);
        return posts
            .stream()
            .filter(post -> !post.isHidden())
            .map(post -> convertToPostResponse(post, currentUser))
            .collect(Collectors.toList());
    }

    public List<PostResponse> getMyPosts() {
        User currentUser = getCurrentUser();
        return getUserPosts(currentUser.getId());
    }

    public List<PostResponse> getAllPosts() {
        User currentUser = getCurrentUser();
        List<BlogPost> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts
            .stream()
            .filter(post -> !post.isHidden())
            .map(post -> convertToPostResponse(post, currentUser))
            .collect(Collectors.toList());
    }

    public List<PostResponse> getPersonalizedFeed() {
        User currentUser = getCurrentUser();

        List<User> followedUsers = subscriptionRepository.findUsersFollowedBy(
            currentUser
        );

        followedUsers.add(currentUser);

        if (followedUsers.isEmpty()) {
            return new ArrayList<>();
        }

        List<BlogPost> posts =
            postRepository.findByAuthorInOrderByCreatedAtDesc(followedUsers);

        return posts
            .stream()
            .filter(post -> !post.isHidden())
            .map(post -> convertToPostResponse(post, currentUser))
            .collect(Collectors.toList());
    }

    private PostResponse convertToPostResponse(
        BlogPost post,
        User currentUser
    ) {
        long likesCount = likeRepository.countByPost(post);
        boolean isLiked = likeRepository.existsByUserAndPost(currentUser, post);

        long commentsCount = commentRepository.countByPost(post);

        return new PostResponse(
            post.getId(),
            post.getTitle(),
            post.getContent(),
            post.getMediaUrl(),
            post.getMediaType(),
            post.getAuthor().getId(),
            post.getAuthor().getUsername(),
            likesCount,
            isLiked,
            commentsCount,
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }
}
