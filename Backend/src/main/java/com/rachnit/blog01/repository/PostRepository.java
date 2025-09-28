package com.rachnit.blog01.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rachnit.blog01.entity.BlogPost;
import com.rachnit.blog01.entity.User;

@Repository
public interface PostRepository extends JpaRepository<BlogPost, Long> {
    
    // Get all posts (newest first) for main feed
    List<BlogPost> findAllByOrderByCreatedAtDesc();

    // Get user's posts
    List<BlogPost> findByAuthor_IdOrderByCreatedAtDesc(Long authorId);

    // Verify ownership
    Optional<BlogPost> findByIdAndAuthor(Long id, User author);
}