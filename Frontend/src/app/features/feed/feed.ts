import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Post } from '../../shared/models';
import { AuthService, PostService } from '../../core/services';
import { PostCreateDialog } from '../posts/post-create-dialog/post-create-dialog';
import { PostEditDialog } from '../posts/post-edit-dialog/post-edit-dialog';
import { PostCard } from '../posts/post-card/post-card';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, RouterLink, PostCard, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit {
  username: string;
  posts = signal<Post[]>([]);

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.username = this.authService.getUsername() || 'Guest';
  }

  ngOnInit(): void {
    console.log('Feed component initialized');
    this.loadFeed();
  }

  /**
   * Load personalized feed
   */
  loadFeed(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService.getPersonalizedFeed().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
        console.log(`Loaded ${posts.length} posts`);

        if (posts.length === 0) {
          console.log('Feed is empty - user may not be following anyone');
        }
      },
      error: (error) => {
        console.error('Failed to load feed:', error);
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load feed. Please try again.');
        this.posts.set([]);
      },
    });
  }

  /**
   * Open create post dialog
   */
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
        console.log('Post created:', result);
        this.loadFeed();
      }
    });
  }

  /**
   * Handle like toggle
   */
  handleLike(post: Post): void {
    console.log('Toggling like for post:', post.id);

    // Store original state for rollback if needed
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
        console.log('Like toggled successfully');
      },
      error: (error) => {
        console.error('Failed to toggle like:', error);

        // Rollback on error - restore original state
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
   * Handle edit post
   */
  handleEdit(post: Post): void {
    console.log('Edit post:', post.id);
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
        console.log('Post updated:', result);
        this.loadFeed();
      }
    });
  }

  /**
   * Handle delete post
   */
  handleDelete(post: Post): void {
    console.log('Delete post:', post.id);

    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          console.log('Post deleted successfully');
          this.loadFeed();
        },
        error: (error) => {
          console.error('❌ Failed to delete post:', error);
          alert('Failed to delete post. Please try again.');
        },
      });
    }
  }

  handleCommentClick(post: Post): void {
    this.router.navigate(['/posts', post.id]);
  }

  goToMyProfile(): void {
    this.router.navigate(['/my-profile']);
  }

  isEmpty(): boolean {
    return !this.isLoading() && this.posts().length === 0;
  }
}
