import { Component, OnInit, signal } from '@angular/core';
import { Post, UserProfileModel } from '../../shared/models';
import { AuthService, PostService, SubscriptionService } from '../../core/services';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PostCreateDialog } from '../posts/post-create-dialog/post-create-dialog';
import { PostEditDialog } from '../posts/post-edit-dialog/post-edit-dialog';
import { PostCard } from '../posts/post-card/post-card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  imports: [CommonModule, PostCard, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
})
export class MyProfile implements OnInit {
  username: string;
  posts = signal<Post[]>([]);
  profile = signal<UserProfileModel | null>(null);

  isLoadingProfile = signal(true);
  isLoadingPosts = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private subscriptionService: SubscriptionService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.username = this.authService.getUsername() || 'Guest';
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyPosts();
  }

  loadProfile(): void {
    this.isLoadingProfile.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoadingProfile.set(false);
        console.log('Profile loaded:', profile.username);
      },
      error: (error) => {
        console.error('Failed to load profile:', error.message);
        this.isLoadingProfile.set(false);
        this.errorMessage.set(error.message || 'Failed to load profile. Please try again.');
      },
    });
  }

  loadMyPosts(): void {
    this.isLoadingPosts.set(true);
    this.errorMessage.set(null);

    this.postService.getMyPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoadingPosts.set(false);
      },
      error: (error) => {
        this.isLoadingPosts.set(false);
        this.errorMessage.set(error.message || 'Failed to load your posts. Please try again.');
        this.posts.set([]);
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PostCreateDialog, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMyPosts();
        this.loadProfile();
      }
    });
  }

  handleLike(post: Post): void {
    console.log('❤️ Toggling like for post:', post.id);

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

        // Rollback on error
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

  handleEdit(post: Post): void {
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
        this.loadMyPosts();
      }
    });
  }

  handleDelete(post: Post): void {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmDelete) return;

    this.postService.deletePost(post.id).subscribe({
      next: () => {
        console.log('✅ Post deleted successfully');
        this.loadMyPosts();
        this.loadProfile();
      },
      error: (error) => {
        console.error('❌ Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      },
    });
  }

  handleCommentClick(post: Post): void {
    console.log('💬 Comment on post:', post.id);
    this.router.navigate([`/posts/${post.id}`]);
  }

  getTotalLikes(): number {
    return this.posts().reduce((sum, post) => sum + post.likesCount, 0);
  }

  getTotalComments(): number {
    return this.posts().reduce((sum, post) => sum + post.commentsCount, 0);
  }
}
