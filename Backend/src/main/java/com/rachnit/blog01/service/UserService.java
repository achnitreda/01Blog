package com.rachnit.blog01.service;

import com.rachnit.blog01.dto.response.UserProfileResponse;
import com.rachnit.blog01.entity.User;
import com.rachnit.blog01.repository.PostRepository;
import com.rachnit.blog01.repository.SubscriptionRepository;
import com.rachnit.blog01.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PostRepository postRepository;

    private User getCurrentUser() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository
            .findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<UserProfileResponse> getAllUsers() {
        User currentUser = getCurrentUser();
        List<User> allUsers = userRepository.findAll();

        return allUsers
            .stream()
            .map(user -> {
                long followersCount = subscriptionRepository.countByFollowing(
                    user
                );
                long followingCount = subscriptionRepository.countByFollower(
                    user
                );
                long postsCount = postRepository.countByAuthor(user);

                boolean isFollowing =
                    subscriptionRepository.existsByFollowerAndFollowing(
                        currentUser,
                        user
                    );
                boolean isOwnProfile = currentUser.getId().equals(user.getId());

                return new UserProfileResponse(
                    user.getId(),
                    user.getUsername(),
                    null,
                    user.getRole(),
                    followersCount,
                    followingCount,
                    postsCount,
                    isFollowing,
                    isOwnProfile,
                    user.getCreatedAt()
                );
            })
            .collect(Collectors.toList());
    }
}
