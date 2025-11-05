import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post, UserProfileModel } from '../../shared/models';
import { PostService, SubscriptionService } from '../../core/services';
import { PostEditDialog } from '../../features/posts/post-edit-dialog/post-edit-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostCard } from '../../features/posts/post-card/post-card';
import { MatMenuModule } from '@angular/material/menu';
import { ReportUserDialog } from '../../shared/components/report-user-dialog/report-user-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, PostCard],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  profile = signal<UserProfileModel | null>(null);
  posts = signal<Post[]>([]);

  isLoadingProfile = signal(true);
  isLoadingPosts = signal(true);
  isFollowLoading = signal(false);

  errorMessage = signal<string | null>(null);

  private userId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private postService: PostService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['userId'];
      if (id && !isNaN(+id)) {
        this.userId = +id;
        this.loadProfile();
      } else {
        console.error('❌ No user ID provided in route');
        this.router.navigate(['/feed']);
      }
    });
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getUserProfile(this.userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoadingProfile.set(false);
        console.log('Profile loaded:', profile.username);

        // Load posts only if following or own profile
        if (profile.isFollowing || profile.isOwnProfile) {
          this.loadUserPosts();
        } else {
          this.isLoadingPosts.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to load profile:', error.message);
        this.isLoadingProfile.set(false);
        this.errorMessage.set(error.message || 'Failed to load profile. Please try again.');
      },
    });
  }

  loadUserPosts(): void {
    this.isLoadingPosts.set(true);

    this.postService.getUserPosts(this.userId).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoadingPosts.set(false);
        console.log(`Loaded ${posts.length} posts for user ${this.userId}`);
      },
      error: (error) => {
        console.error('Failed to load user posts:', error);
        this.isLoadingPosts.set(false);
      },
    });
  }

  openReportDialog(): void {
    const currentProfile = this.profile();
    if (!currentProfile) return;

    const dialogRef = this.dialog.open(ReportUserDialog, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true,
      data: {
        userId: currentProfile.userId,
        username: currentProfile.username,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        console.log('✅ Report submitted successfully');
      }
    });
  }

  handleFollow(): void {
    if (!this.profile()) return;

    const currentProfile = this.profile()!;
    const isCurrentlyFollowing = currentProfile.isFollowing;

    console.log(isCurrentlyFollowing ? '👥 Unfollowing user...' : '👥 Following user...');
    this.isFollowLoading.set(true);

    const action$ = isCurrentlyFollowing
      ? this.subscriptionService.unfollowUser(this.userId)
      : this.subscriptionService.followUser(this.userId);

    action$.subscribe({
      next: (response) => {
        console.log('Follow action successful:', response.message);
        this.isFollowLoading.set(false);

        // Update profile state
        this.profile.update((current) => {
          if (current) {
            return {
              ...current,
              isFollowing: response.isFollowing,
              followersCount: response.isFollowing
                ? current.followersCount + 1
                : Math.max(0, current.followersCount - 1),
            };
          }
          return current;
        });

        if (response.isFollowing) {
          // because of this condition
          this.loadUserPosts();
        } else {
          // If unfollowed, clear posts
          this.posts.set([]);
        }
      },
      error: (error) => {
        console.error('Failed to toggle follow:', error.message);
        this.isFollowLoading.set(false);
        alert(error.message || 'Failed to update follow status. Please try again.');
      },
    });
  }

  handleLike(post: Post): void {
    console.log('Toggling like for post:', post.id);

    // Optimistic update
    const originalIsLiked = post.isLiked;
    const originalLikesCount = post.likesCount;

    const updatedPosts = this.posts().map((p) => {
      if (p.id === post.id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
        };
      }
      return p;
    });

    this.posts.set(updatedPosts);

    this.postService.toggleLike(post).subscribe({
      next: () => {
        console.log('✅ Like toggled successfully');
      },
      error: (error) => {
        console.error('❌ Failed to toggle like:', error);

        const rolledBackPosts = this.posts().map((p) => {
          if (p.id === post.id) {
            return {
              ...p,
              isLiked: originalIsLiked,
              likesCount: originalLikesCount,
            };
          }
          return p;
        });

        this.posts.set(rolledBackPosts);
        alert('Failed to update like. Please try again.');
      },
    });
  }

  /**
   * Handle edit post (only for own profile)
   */
  handleEdit(post: Post): void {
    console.log('✏️ Opening edit dialog for post:', post.id);

    const dialogRef = this.dialog.open(PostEditDialog, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      data: { post: post },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('✅ Post updated:', result);
        this.loadUserPosts();
      }
    });
  }

  /**
   * Handle delete post (only for own profile)
   */
  handleDelete(post: Post): void {
    console.log('🗑️ Delete post:', post.id);

    const confirmDelete = confirm(
      `Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmDelete) return;

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        console.log('✅ Post deleted successfully');
        this.loadProfile();
        this.loadUserPosts();
      },
      error: (error) => {
        console.error('❌ Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      },
    });
  }

  handleCommentClick(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  canSeePosts(): boolean {
    const profile = this.profile();
    if (!profile) return false;
    return profile.isFollowing || profile.isOwnProfile;
  }

  getFollowButtonText(): string {
    return this.profile()?.isFollowing ? 'Following' : 'Follow';
  }

  getFollowButtonIcon(): string {
    return this.profile()?.isFollowing ? 'check' : 'person_add';
  }
}
