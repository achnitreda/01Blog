import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommentCard } from '../comment-card/comment-card';
import { Comment } from '../../../shared/models';

@Component({
  selector: 'app-comment-list',
  imports: [CommonModule, MatIconModule, CommentCard],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.scss',
})
export class CommentList {
  @Input() comments: Comment[] = [];
  @Input() isLoading: boolean = false;

  @Output() onDelete = new EventEmitter<Comment>();

  handleDelete(comment: Comment): void {
    console.log('📤 Comment list forwarding delete event:', comment.id);
    this.onDelete.emit(comment);
  }

  getCommentCountText(): string {
    const count = this.comments.length;
    return count === 1 ? '1 Comment' : `${count} Comments`;
  }
}
