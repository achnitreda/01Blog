package com.rachnit.blog01.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.Comment;
import com.rachnit.blog01.entity.User;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Get all comments for a post by post ID
     */
    List<Comment> findByPost_IdOrderByCreatedAtDesc(Long postId);
    
    /**
     * Count comments for a specific post
     */
    long countByPost(BlogPost post);

    /**
     * Find comment by ID and author (for ownership verification when deleting)
    */
    Optional<Comment> findByIdAndAuthor(Long id, User author);
}
