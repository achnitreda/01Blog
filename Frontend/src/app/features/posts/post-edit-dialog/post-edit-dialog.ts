import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MediaType, Post, UpdatePostRequest } from '../../../shared/models';
import { PostService } from '../../../core/services';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-post-edit-dialog',
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
  templateUrl: './post-edit-dialog.html',
  styleUrl: '../post-create-dialog/post-create-dialog.scss',
})
export class PostEditDialog implements OnInit {
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
    private dialogRef: MatDialogRef<PostEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { post: Post }, // ← Receive post data
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.populateForm();
  }

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

  private populateForm(): void {
    const post = this.data.post;

    this.postForm.patchValue({
      title: post.title,
      content: post.content,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
    });

    // Set initial preview
    this.mediaPreview.set(post.mediaUrl);

    console.log('📝 Editing post:', post.id, post.title);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    if (!this.hasChanges()) {
      console.log('ℹ️ No changes detected, closing dialog');
      this.dialogRef.close();
      return;
    }

    this.isSubmitting.set(true);

    const updateData: UpdatePostRequest = {};

    if (this.postForm.value.title !== this.data.post.title) {
      updateData.title = this.postForm.value.title.trim();
    }

    if (this.postForm.value.content !== this.data.post.content) {
      updateData.content = this.postForm.value.content.trim();
    }

    if (this.postForm.value.mediaUrl !== this.data.post.mediaUrl) {
      updateData.mediaUrl = this.postForm.value.mediaUrl.trim();
    }

    if (this.postForm.value.mediaType !== this.data.post.mediaType) {
      updateData.mediaType = this.postForm.value.mediaType;
    }

    this.postService.updatePost(this.data.post.id, updateData).subscribe({
      next: (updatedPost) => {
        console.log('✅ Post updated successfully:', updatedPost.id);
        this.isSubmitting.set(false);

        // Close dialog and return the updated post
        this.dialogRef.close(updatedPost);
      },
      error: (error) => {
        console.error('❌ Failed to update post:', error.message);
        this.isSubmitting.set(false);
        this.errorMessage.set(error.message || 'Failed to update post. Please try again.');
      },
    });
  }

  private hasChanges(): boolean {
    return (
      this.postForm.value.title !== this.data.post.title ||
      this.postForm.value.content !== this.data.post.content ||
      this.postForm.value.mediaUrl !== this.data.post.mediaUrl ||
      this.postForm.value.mediaType !== this.data.post.mediaType
    );
  }

  onCancel(): void {
    // Check if there are unsaved changes
    if (this.hasChanges() && this.postForm.dirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirm) return;
    }

    this.dialogRef.close();
  }

  getTitleCharCount(): string {
    const length = this.postForm.get('title')?.value?.length || 0;
    return `${length}/${this.TITLE_MAX}`;
  }

  getContentCharCount(): string {
    const length = this.postForm.get('content')?.value?.length || 0;
    return `${length}/${this.CONTENT_MAX}`;
  }

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

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
      mediaUrl: 'Media URL',
      mediaType: 'Media Type',
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isVideoPreview(): boolean {
    return this.postForm.get('mediaType')?.value === MediaType.VIDEO;
  }

  isImagePreview(): boolean {
    return this.postForm.get('mediaType')?.value === MediaType.IMAGE;
  }
}
