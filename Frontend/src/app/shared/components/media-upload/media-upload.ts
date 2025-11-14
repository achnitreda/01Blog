import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-media-upload',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './media-upload.html',
  styleUrl: './media-upload.scss',
})
export class MediaUpload {
  @Input() maxImageSize: number = 5 * 1024 * 1024; // 5MB default
  @Input() maxVideoSize: number = 50 * 1024 * 1024;
  @Input() allowedImageTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  @Input() allowedVideoTypes: string[] = ['video/mp4', 'video/webm', 'video/quicktime'];
  @Input() existingMediaUrl?: string;

  // Output events
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  errorMessage: string | null = null;
  isDragging: boolean = false;

  isImage: boolean = false;
  isVideo: boolean = false;

  ngOnInit(): void {
    if (this.existingMediaUrl) {
      this.previewUrl = this.existingMediaUrl;
      this.isImage = this.existingMediaUrl.includes('/image/');
      this.isVideo = this.existingMediaUrl.includes('/video/');
    }
  }

  onFileInputChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    this.errorMessage = null;

    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.errorMessage = validation.error || 'Invalid file';
      console.error('Validation failed:', this.errorMessage);
      return;
    }

    this.selectedFile = file;

    this.isImage = file.type.startsWith('image/');
    this.isVideo = file.type.startsWith('video/');

    this.createPreview(file);

    this.fileSelected.emit(file);
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    const allAllowedTypes = [...this.allowedImageTypes, ...this.allowedVideoTypes];
    if (!allAllowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed. Allowed: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM, MOV)`,
      };
    }

    const isImage = this.allowedImageTypes.includes(file.type);
    const isVideo = this.allowedVideoTypes.includes(file.type);

    if (isImage && file.size > this.maxImageSize) {
      const maxSizeMB = (this.maxImageSize / 1024 / 1024).toFixed(2);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        valid: false,
        error: `Image too large. Maximum: ${maxSizeMB} MB, your file: ${fileSizeMB} MB`,
      };
    }

    if (isVideo && file.size > this.maxVideoSize) {
      const maxSizeMB = (this.maxVideoSize / 1024 / 1024).toFixed(2);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        valid: false,
        error: `Video too large. Maximum: ${maxSizeMB} MB, your file: ${fileSizeMB} MB`,
      };
    }

    return { valid: true };
  }

  private createPreview(file: File): void {
    // Revoke old preview URL to avoid memory leaks
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    // Create new preview URL
    this.previewUrl = URL.createObjectURL(file);
  }

  getAcceptAttribute(): string {
    return [...this.allowedImageTypes, ...this.allowedVideoTypes].join(',');
  }

  getFileSizeFormatted(): string {
    if (!this.selectedFile) return '';

    const bytes = this.selectedFile.size;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  removeFile(): void {
    // Revoke preview URL
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.selectedFile = null;
    this.previewUrl = null;
    this.errorMessage = null;
    this.isImage = false;
    this.isVideo = false;

    this.fileRemoved.emit();
  }
}
