import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommentService, PostService } from '../../core/services';
import { Comment, CreateCommentRequest, Post } from '../../shared/models';
import { PostEditDialog } from '../posts/post-edit-dialog/post-edit-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostCard } from '../posts/post-card/post-card';
import { CommentList } from '../comments/comment-list/comment-list';
import { AddComment } from '../comments/add-comment/add-comment';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, MatButtonModule, MatIconModule, PostCard, CommentList, AddComment],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);

  isLoadingPost = signal(true);
  isLoadingComments = signal(true);
  isSubmittingComment = signal(false);

  errorMessage = signal<string | null>(null);

  private postId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Get post ID from route
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !isNaN(+id)) {
        this.postId = +id;
        console.log('📄 Post Detail page loaded for post ID:', this.postId);
        this.loadPost();
        this.loadComments();
      } else {
        console.error('❌ Invalid post ID:', id);
        this.errorMessage.set('Invalid post ID');
        this.isLoadingPost.set(false);
      }
    });
  }

  loadPost(): void {
    this.isLoadingPost.set(true);
    this.errorMessage.set(null);

    this.postService.getPostById(this.postId).subscribe({
      next: (post) => {
        this.post.set(post);
        this.isLoadingPost.set(false);
        console.log('✅ Post loaded:', post.id, post.title);
      },
      error: (error) => {
        console.error('❌ Failed to load post:', error.message);
        this.isLoadingPost.set(false);
        this.errorMessage.set(error.message || 'Failed to load post. Please try again.');
      },
    });
  }

  loadComments(): void {
    this.isLoadingComments.set(true);

    this.commentService.getComments(this.postId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.isLoadingComments.set(false);
        console.log(`✅ Loaded ${comments.length} comments`);
      },
      error: (error) => {
        console.error('❌ Failed to load comments:', error.message);
        this.isLoadingComments.set(false);
      },
    });
  }

  handleNewComment(request: CreateCommentRequest): void {
    this.isSubmittingComment.set(true);

    this.commentService.createComment(this.postId, request).subscribe({
      next: (newComment) => {
        console.log('✅ Comment created:', newComment.id);
        this.isSubmittingComment.set(false);

        this.comments.update((current) => [...current, newComment]);

        // Update post's comment count
        if (this.post()) {
          this.post.update((current) => {
            if (current) {
              return { ...current, commentsCount: current.commentsCount + 1 };
            }
            return current;
          });
        }
        console.log('✅ Comment added to list, count updated');
      },
      error: (error) => {
        console.error('❌ Failed to create comment:', error.message);
        this.isSubmittingComment.set(false);
        alert('Failed to post comment. Please try again.');
      },
    });
  }

  handleDeleteComment(comment: Comment): void {
    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        console.log('✅ Comment deleted successfully');

        // Remove comment from the list
        this.comments.update((current) => current.filter((c) => c.id !== comment.id));

        // Update post's comment count
        if (this.post()) {
          this.post.update((current) => {
            if (current) {
              return { ...current, commentsCount: Math.max(0, current.commentsCount - 1) };
            }
            return current;
          });
        }

        console.log('✅ Comment removed from list, count updated');
      },
      error: (error) => {
        console.error('❌ Failed to delete comment:', error.message);
        alert('Failed to delete comment. Please try again.');
      },
    });
  }

  handleLike(post: Post): void {
    const originalIsLiked = post.isLiked;
    const originalLikesCount = post.likesCount;

    this.post.update((current) => {
      if (current) {
        return {
          ...current,
          isLiked: !current.isLiked,
          likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount + 1,
        };
      }
      return current;
    });

    this.postService.toggleLike(post).subscribe({
      next: () => {
        console.log('✅ Like toggled successfully');
      },
      error: (error) => {
        console.error('❌ Failed to toggle like:', error);

        this.post.update((current) => {
          if (current) {
            return {
              ...current,
              isLiked: originalIsLiked,
              likesCount: originalLikesCount,
            };
          }
          return current;
        });

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
        console.log('✅ Post updated:', result);
        this.post.set(result); // Update the post with new data
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
        // Navigate back to feed
        this.router.navigate(['/feed']);
      },
      error: (error) => {
        console.error('❌ Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      },
    });
  }

  /**
   * Handle comment click (already on detail page, do nothing)
   */
  handleCommentClick(post: Post): void {
    console.log('💬 Already on post detail page');
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  retryLoadPost(): void {
    this.loadPost();
    this.loadComments();
  }
}
