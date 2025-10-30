import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CreateCommentRequest } from '../../../shared/models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-comment',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-comment.html',
  styleUrl: './add-comment.scss',
})
export class AddComment {
  @Output() onComment = new EventEmitter<CreateCommentRequest>();

  commentForm!: FormGroup;
  isSubmitting = signal(false);

  readonly CONTENT_MIN = 1;
  readonly CONTENT_MAX = 500;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  initForm(): void {
    this.commentForm = this.fb.group({
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(this.CONTENT_MIN),
          Validators.maxLength(this.CONTENT_MAX),
        ],
      ],
    });
  }

  onSubmit(): void {
    if (this.commentForm.invalid) {
      this.markFormGroupTouched(this.commentForm);
      return;
    }

    const content = this.commentForm.value.content.trim();

    if (!content) {
      this.commentForm.patchValue({ content: '' });
      this.commentForm.get('content')?.markAsTouched();
      return;
    }

    const request: CreateCommentRequest = { content };
    this.onComment.emit(request);

    this.commentForm.reset();
    this.commentForm.markAsUntouched();
  }

  getCharacterCount(): string {
    const length = this.commentForm.get('content')?.value?.length || 0;
    return `${length}/${this.CONTENT_MAX}`;
  }

  isApproachingLimit(): boolean {
    const length = this.commentForm.get('content')?.value?.length || 0;
    return length > this.CONTENT_MAX * 0.9; // 90% of limit
  }

  getErrorMessage(fieldName: string): string {
    const field = this.commentForm.get(fieldName);

    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return 'Comment cannot be empty';
    }

    if (field.hasError('minlength')) {
      return `Comment must be at least ${this.CONTENT_MIN} character`;
    }

    if (field.hasError('maxlength')) {
      return `Comment must not exceed ${this.CONTENT_MAX} characters`;
    }

    return '';
  }

  isSubmitDisabled(): boolean {
    return this.commentForm.invalid || this.isSubmitting();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
