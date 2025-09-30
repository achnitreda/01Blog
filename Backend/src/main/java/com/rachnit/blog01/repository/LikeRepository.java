package com.rachnit.blog01.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.Like;
import com.rachnit.blog01.entity.User;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    /**
     * Check if user has liked a specific post
     */
    boolean existsByUserAndPost(User user, BlogPost post);

    /**
     * Find like by user and post (for unlike operation)
     * Get actual like record for deletion
     */
    Optional<Like> findByUserAndPost(User user, BlogPost post);

    /**
     * Count total likes for a post
     */
    long countByPost(BlogPost post);

    /**
     * Delete like (unlike operation)
     */
    void deleteByUserAndPost(User user, BlogPost post);
}