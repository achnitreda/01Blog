import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

// Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PostService } from '../../../core/services';
import { MediaUpload } from '../../../shared/components/media-upload/media-upload';

@Component({
  selector: 'app-post-create-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MediaUpload,
  ],
  templateUrl: './post-create-dialog.html',
  styleUrl: './post-create-dialog.scss',
})
export class PostCreateDialog implements OnInit {
  postForm!: FormGroup;

  // Signals for reactive state
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  // Character limits
  readonly TITLE_MIN = 3;
  readonly TITLE_MAX = 255;
  readonly CONTENT_MIN = 10;
  readonly CONTENT_MAX = 10000;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private dialogRef: MatDialogRef<PostCreateDialog>,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize form with validation
   */
  private initForm(): void {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(this.TITLE_MIN),
          Validators.maxLength(this.TITLE_MAX),
          Validators.pattern(/^[a-zA-Z0-9\s.,!?'-]+$/),
        ],
      ],
      content: [
        '',
        [
          Validators.required,
          Validators.minLength(this.CONTENT_MIN),
          Validators.maxLength(this.CONTENT_MAX),
          Validators.pattern(/^[^<>"']*$/),
        ],
      ],
    });
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.errorMessage.set(null);
  }

  onFileRemoved(): void {
    this.selectedFile.set(null);
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Clear previous errors
    this.errorMessage.set(null);

    // Validate form
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    // Show loading state
    this.isSubmitting.set(true);
    this.postForm.disable();

    // Get form values
    const title = this.postForm.value.title.trim();
    const content = this.postForm.value.content.trim();
    const media = this.selectedFile();

    // Call post service
    this.postService.createPostWithFile(title, content, media).subscribe({
      next: (post) => {
        console.log('Post created successfully:', post.id);
        this.isSubmitting.set(false);
        this.postForm.enable();
        // Close dialog and return the created post
        this.dialogRef.close(post);
      },
      error: (error) => {
        console.error('Failed to create post:', error.message);
        this.isSubmitting.set(false);
        this.postForm.enable();
        this.errorMessage.set(error.message || 'Failed to create post. Please try again.');
      },
    });
  }

  /**
   * Close dialog without saving
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Get character count for title
   */
  getTitleCharCount(): string {
    const length = this.postForm.get('title')?.value?.length || 0;
    return `${length}/${this.TITLE_MAX}`;
  }

  /**
   * Get character count for content
   */
  getContentCharCount(): string {
    const length = this.postForm.get('content')?.value?.length || 0;
    return `${length}/${this.CONTENT_MAX}`;
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.postForm.get(fieldName);

    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (fieldName === 'title') {
      if (field.hasError('minlength')) {
        return `Title must be at least ${this.TITLE_MIN} characters`;
      }
      if (field.hasError('maxlength')) {
        return `Title must not exceed ${this.TITLE_MAX} characters`;
      }
      if (field.hasError('pattern')) {
        return 'Title can only contain letters, numbers, spaces, and basic punctuation';
      }
    }

    if (fieldName === 'content') {
      if (field.hasError('minlength')) {
        return `Content must be at least ${this.CONTENT_MIN} characters`;
      }
      if (field.hasError('maxlength')) {
        return `Content must not exceed ${this.CONTENT_MAX} characters`;
      }
      if (field.hasError('pattern')) {
        return 'Content cannot contain HTML tags or script characters';
      }
    }

    return '';
  }

  /**
   * Get field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
