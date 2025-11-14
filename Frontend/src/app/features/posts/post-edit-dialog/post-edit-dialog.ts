import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Post } from '../../../shared/models';
import { PostService } from '../../../core/services';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MediaUpload } from '../../../shared/components/media-upload/media-upload';

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
    MediaUpload,
  ],
  templateUrl: './post-edit-dialog.html',
  styleUrl: '../post-create-dialog/post-create-dialog.scss',
})
export class PostEditDialog implements OnInit {
  postForm!: FormGroup;

  // Signals for reactive state
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  existingMediaUrl = signal<string | undefined>(undefined);
  mediaChanged = signal(false);

  // Character limits
  readonly TITLE_MIN = 3;
  readonly TITLE_MAX = 255;
  readonly CONTENT_MIN = 10;
  readonly CONTENT_MAX = 10000;

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
    });
  }

  private populateForm(): void {
    const post = this.data.post;

    this.postForm.patchValue({
      title: post.title,
      content: post.content,
    });

    if (post.mediaUrl) {
      this.existingMediaUrl.set(post.mediaUrl);
    }
  }

  onFileSelected(file: File): void {
    this.selectedFile.set(file);
    this.mediaChanged.set(true);
    this.errorMessage.set(null);
  }

  onFileRemoved(): void {
    this.selectedFile.set(null);
    this.mediaChanged.set(true);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    if (!this.hasChanges()) {
      this.dialogRef.close();
      return;
    }

    this.isSubmitting.set(true);
    this.postForm.disable();

    const currentTitle = this.postForm.value.title.trim();
    const currentContent = this.postForm.value.content.trim();

    const titleChanged = currentTitle !== this.data.post.title;
    const contentChanged = currentContent !== this.data.post.content;

    this.postService
      .updatePostWithFile(
        this.data.post.id,
        titleChanged ? currentTitle : undefined,
        contentChanged ? currentContent : undefined,
        this.mediaChanged() ? this.selectedFile() : undefined,
      )
      .subscribe({
        next: (updatedPost) => {
          console.log('Post updated successfully:', updatedPost.id);
          this.isSubmitting.set(false);
          this.postForm.enable();
          // Close dialog and return the updated post
          this.dialogRef.close(updatedPost);
        },
        error: (error) => {
          console.error('Failed to update post:', error.message);
          this.isSubmitting.set(false);
          this.postForm.enable();
          this.errorMessage.set(error.message || 'Failed to update post. Please try again.');
        },
      });
  }

  private hasChanges(): boolean {
    const titleChanged = this.postForm.value.title !== this.data.post.title;
    const contentChanged = this.postForm.value.content !== this.data.post.content;
    const mediaChangedFlag = this.mediaChanged();

    return titleChanged || contentChanged || mediaChangedFlag;
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
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      content: 'Content',
    };
    return labels[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
