package com.rachnit.blog01.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.Subscription;
import com.rachnit.blog01.entity.User;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    /**
     * Check if follower is following the target user
     */
    boolean existsByFollowerAndFollowing(User follower, User following);

     /**
     * Find subscription relationship between two users
     */
    Optional<Subscription> findByFollowerAndFollowing(User follower, User following);

    /**
     * Get all users that a person is following (for personalized feed)
     */
    @Query("SELECT s.following FROM Subscription s WHERE s.follower = :follower")
    List<User> findUsersFollowedBy(@Param("follower") User follower);

    /**
     * NEW: Get all followers of a user (for notification generation)
     */
    @Query("SELECT s.follower FROM Subscription s WHERE s.following = :user")
    List<User> findFollowersByFollowing(@Param("user") User user);

    long countByFollowing(User user);

    long countByFollower(User user);

    void deleteByFollowerAndFollowing(User follower, User following);
}
