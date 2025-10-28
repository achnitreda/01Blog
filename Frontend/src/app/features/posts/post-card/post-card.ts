import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { Post } from '../../../shared/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-post-card',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  // Post data (required)
  @Input({ required: true }) post!: Post;

  // Event emitters
  @Output() onLike = new EventEmitter<Post>();
  @Output() onEdit = new EventEmitter<Post>();
  @Output() onDelete = new EventEmitter<Post>();
  @Output() onCommentClick = new EventEmitter<Post>();

  // Signals for reactive state
  isLiking = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  isOwnPost(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.username === this.post.authorUsername;
  }

  // I don't understand is it just for liking what about disliking ??
  handleLike(): void {
    if (this.isLiking()) return; // Prevent double clicks

    this.isLiking.set(true);
    this.onLike.emit(this.post);

    // Reset after animation
    setTimeout(() => this.isLiking.set(false), 500);
  }

  handleEdit(): void {
    this.onEdit.emit(this.post);
  }

  handleDelete(): void {
    this.onDelete.emit(this.post);
  }

  handleCommentClick(): void {
    this.onCommentClick.emit(this.post);
  }

  goToAuthorProfile(): void {
    this.router.navigate(['profile', this.post.authorUsername]);
  }

  goToPostDetail(): void {
    this.router.navigate(['/posts', this.post.id]);
  }

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(): string {
    const now = new Date();
    const postDate = new Date(this.post.createdAt);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  isVideo(): boolean {
    return this.post.mediaType === 'video';
  }

  isImage(): boolean {
    return this.post.mediaType === 'image';
  }

  /**
   * Format like count (e.g., 1234 → 1.2K)
   */
  formatLikeCount(): string {
    const count = this.post.likesCount;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  formatCommentCount(): string {
    const count = this.post.commentsCount;
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }
}
