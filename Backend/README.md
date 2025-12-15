# Backend for 01Blog - Social Blogging Platform

## Technologies Used
  - Backend: Java 17, Spring Boot 3.4.9, Spring Security, JWT, Cloudinary, JPA/Hibernate
  - Database: PostgreSQL (prod), H2 (dev)
  - Build Tool: Gradle

## Setup:

### Dependencies used:
  ```
  1 - Spring Web
  2 - Spring Data JPA
  3 - Spring Security
  4 - PostgreSQL Driver
  5 - Spring Boot DevTools
  6 - Validation
  7 - H2 Database
  ```

### Access the PostgreSQL Container:

```sh
# Enter the container
docker exec -it blog-postgres /bin/sh

# Connect to database
psql -U username -d dbname

# Now you're in PostgreSQL shell!
dbname=# \dt              # List tables
dbname=# SELECT * FROM users;
```

## 📁 Backend Structure:
  ```
  src/main/java/com/rachnit/
      blog01/
          ├── Blog01Application.java
          ├── entity/
          │   ├── User.java
          |   ├── BlogPost.java
          |   ├── Subscription.java
          |   ├── Like.java
          |   ├── Comment.java
          |   ├── Notification.java
          |   ├── Report.java
          ├── enums/
          │   └── Role.java
          ├── dto/
          │   ├── request/
          │   │   ├── RegisterRequest.java
          │   │   ├── LoginRequest.java
          │   │   ├── CreatePostRequest.java
          |   |   ├── UpdatePostRequest.java
          |   |   ├── CreateCommentRequest.java
          |   |   ├── CreateReportRequest.java
          │   └── response/
          │   │   ├── AuthResponse.java
          |   |   ├── PostResponse.java
          |   |   ├── FollowResponse.java
          |   |   ├── UserProfileResponse.java
          |   |   ├── LikeResponse.java
          |   |   ├── CommentResponse.java
          |   |   ├── NotificationResponse.java
          |   |   ├── NotificationSummaryResponse.java
          |   |   ├── ReportResponse.java
          |   |   ├── AdminUserResponse.java
          |   |   ├── AdminPostResponse.java
          |   └── error/
          │       └── ErrorResponse.java
          ├── repository/
          │   ├── UserRepository.java
          |   ├── PostRepository.java
          |   ├── SubscriptionRepository.java
          |   ├── LikeRepository.java
          |   ├── CommentRepository.java
          |   ├── NotificationRepository.java
          |   ├── ReportRepository.java
          ├── service/
          │   ├── JwtService.java
          │   ├── UserDetailsServiceImpl.java
          │   ├── AuthService.java
          │   ├── UserService.java
          |   ├── PostService.java
          |   ├── SubscriptionService.java
          |   ├── LikeService.java
          |   ├── CommentService.java
          |   ├── NotificationService.java
          |   ├── ReportService.java
          |   ├── AdminService.java
          |   ├── CloudinaryService.java
          ├── controller/
          │   ├── AuthController.java
          |   ├── UserController.java
          |   ├── PostController.java
          |   ├── SubscriptionController.java
          |   ├── LikeController.java
          |   ├── CommentController.java
          |   ├── NotificationController.java
          |   ├── ReportController.java
          |   ├── AdminController.java
          |   ├── MediaConfigTestController.java
          ├── config/
          │   |── JwtProperties.java
          |   |── DatabaseProperties.java
          |   |── SecurityConfig.java
          |   |── MediaUploadProperties.java
          |   |── CloudinaryConfig.java
          ├── util/
          │   └── MediaValidator.java
          ├── security/
          │   ├── JwtRequestFilter.java
          │   ├── JwtAuthenticationEntryPoint.java
          |   ├── CustomAccessDeniedHandler.java
          └── exception/
              └── GlobalExceptionHandler.java
      resources/
          ├── application.properties              (base config)
          ├── application-dev.properties          (H2 - quick dev)
          ├── application-postgres.properties     (PostgreSQL - local testing)
          └── application-prod.properties         (PostgreSQL - production)
      .env
      Dockerfile
      .gitignore
      .dockerignore
  ```

## Backend endpoints:
  ```
  ✅ POST   /api/auth/register   # register a new user
  ✅ POST   /api/auth/login      # login a user
  ___
  ✅ GET    /api/users                       # Get All users
  ✅ GET    /api/users/{userId}/profile      # Get user profile with stats
  ✅ GET    /api/users/my-profile            # Get current user's profile
  ✅ GET    /api/users/{userId}/posts        # Get specific user's posts
  ✅ POST   /api/users/{userId}/follow       # Follow a user
  ✅ DELETE /api/users/{userId}/unfollow     # Unfollow a user
  ___
  ❔ GET    /api/posts           # Get all posts (feed)
  ✅ GET    /api/posts/feed      # Personalized feed
  ✅ GET    /api/posts/my-posts  # Get current user's posts
  ✅ GET    /api/posts/{id}      # Get specific post
  ✅ POST   /api/posts           # Create new post
  ✅ PUT    /api/posts/{id}      # Update own post
  ✅ DELETE /api/posts/{id}      # Delete own post
  ___
  ✅ POST    /api/posts/{postId}/like
  ✅ DELETE  /api/posts/{postId}/unlike
  ❔ GET     /api/posts/{postId}/likes
  ____
  ✅ POST     /api/posts/{postId}/comments
  ✅ GET      /api/posts/{postId}/comments
  ✅ DELETE   /api/commments/{commentId}
  ____
  ✅ GET     /api/notifications              # Get unread notifications
  ✅ GET     /api/notifications/summary      # Get unread count for badge
  ✅ PUT     /api/notifications/{id}/read    # Mark notification as read
  ___
  ✅ POST    /api/reports/user/{userId}     # Submit a report against another user
  ___
  - User Management:
    ✅  GET     /api/admin/users                 List all users
    ❔  GET     /api/admin/users/{userId}        Get user details
    ✅  PUT     /api/admin/users/{userId}/ban    Ban a user
    ✅  PUT     /api/admin/users/{userId}/unban  Unban a user
    ✅  DELETE  /api/admin/users/{userId}        Delete user permanently
  - Post Management:
    ✅  GET     /api/admin/posts                    List all posts
    ❔  GET     /api/admin/posts/{postId}           Get post details
    ✅  PUT     /api/admin/posts/{postId}/hide      Hide a post
    ✅  PUT     /api/admin/posts/{postId}/unhide    Unhide a post
    ✅  DELETE  /api/admin/posts/{postId}           Delete post permanently
  - Report Management:
    ✅  GET     /api/admin/reports                      List all reports
    ✅  GET     /api/admin/reports/status/{status}      Filter by status
    ❔  GET     /api/admin/reports/{reportId}           Get report details
    ❔  GET     /api/admin/reports/user/{userId}        Reports against user
    ✅  PUT     /api/admin/reports/{reportId}/resolve   Resolve report
    ❔  GET     /api/admin/reports/statistics           Report stats
  - Dashboard:
    ✅  GET     /api/admin/dashboard/statistics         Platform statistics
  ```
