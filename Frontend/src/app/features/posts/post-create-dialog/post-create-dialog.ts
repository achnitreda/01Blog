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
import { CreatePostRequest, MediaType } from '../../../shared/models';

@Component({
  selector: 'app-post-create-dialog',
  standalone: true,
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
  ],
  templateUrl: './post-create-dialog.html',
  styleUrl: './post-create-dialog.scss',
})
export class PostCreateDialog implements OnInit {
  postForm!: FormGroup;

  // Signals for reactive state
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  mediaPreview = signal<string | null>(null);

  // Character limits
  readonly TITLE_MIN = 3;
  readonly TITLE_MAX = 255;
  readonly CONTENT_MIN = 10;
  readonly CONTENT_MAX = 10000;

  // Media types
  readonly MediaType = MediaType;

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
      mediaUrl: [
        '',
        [
          Validators.required,
          Validators.maxLength(1000),
          Validators.pattern(/^https?:\/\/.*\.(jpg|jpeg|png|gif|mp4|mov|avi)$/i),
        ],
      ],
      mediaType: [MediaType.IMAGE, Validators.required],
    });

    // Watch media URL changes for preview
    this.postForm.get('mediaUrl')?.valueChanges.subscribe((url) => {
      if (url && this.postForm.get('mediaUrl')?.valid) {
        this.mediaPreview.set(url);
      } else {
        this.mediaPreview.set(null);
      }
    });
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

    // Prepare post data
    const postData: CreatePostRequest = {
      title: this.postForm.value.title.trim(),
      content: this.postForm.value.content.trim(),
      mediaUrl: this.postForm.value.mediaUrl.trim(),
      mediaType: this.postForm.value.mediaType,
    };

    console.log('📝 Creating post:', postData);

    // Call post service
    this.postService.createPost(postData).subscribe({
      next: (post) => {
        console.log('✅ Post created successfully:', post.id);
        this.isSubmitting.set(false);

        // Close dialog and return the created post
        this.dialogRef.close(post);
      },
      error: (error) => {
        console.error('❌ Failed to create post:', error.message);
        this.isSubmitting.set(false);
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

    if (fieldName === 'mediaUrl') {
      if (field.hasError('pattern')) {
        return 'Must be a valid image URL (jpg, jpeg, png, gif) or video URL (mp4, mov, avi)';
      }
      if (field.hasError('maxlength')) {
        return 'URL must not exceed 1000 characters';
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
      mediaUrl: 'Media URL',
      mediaType: 'Media Type',
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

  /**
   * Check if media preview is video
   */
  isVideoPreview(): boolean {
    return this.postForm.get('mediaType')?.value === MediaType.VIDEO;
  }

  /**
   * Check if media preview is image
   */
  isImagePreview(): boolean {
    return this.postForm.get('mediaType')?.value === MediaType.IMAGE;
  }
}
