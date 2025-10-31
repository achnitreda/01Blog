import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../../core/services';
import { Comment } from '../../../shared/models';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comment-card',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TimeAgoPipe],
  templateUrl: './comment-card.html',
  styleUrl: './comment-card.scss',
})
export class CommentCard {
  @Input() comment!: Comment;

  @Output() onDelete = new EventEmitter<Comment>();

  private currentUsername: string | null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUsername = this.authService.getUsername();
  }

  isMyComment(): boolean {
    return this.comment.authorUsername === this.currentUsername;
  }

  goToAuthorProfile(): void {
    this.router.navigate(['/users', this.comment.authorId]);
  }

  handleDelete(): void {
    const confirmDelete = confirm(
      'Are you sure you want to delete this comment?\n\nThis action cannot be undone.',
    );

    if (confirmDelete) {
      console.log('🗑️ Deleting comment:', this.comment.id);
      this.onDelete.emit(this.comment);
    }
  }
}
