import { Component, Inject, signal } from '@angular/core';
import { ReportService } from '../../../core/services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ReportUserDialogData {
  userId: number;
  username: string;
}

@Component({
  selector: 'app-report-user-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './report-user-dialog.html',
  styleUrl: './report-user-dialog.scss',
})
export class ReportUserDialog {
  reason = signal('');
  isSubmitting = signal(false);
  showConfirmation = signal(false);
  errorMessage = signal<string | null>(null);

  readonly MIN_LENGTH = 10;
  readonly MAX_LENGTH = 500;

  constructor(
    private reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) public data: ReportUserDialogData,
    private dialogRef: MatDialogRef<ReportUserDialog>,
  ) {}

  onReasonChange(value: string): void {
    this.reason.set(value);
    this.errorMessage.set(null);
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    const validation = this.reportService.validateReason(this.reason());
    if (!validation.valid) {
      this.errorMessage.set(validation.error || 'Invalid reason');
      return;
    }
    this.showConfirmation.set(true);
  }

  confirmSubmit(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.reportService.submitReport(this.data.userId, this.reason().trim()).subscribe({
      next: (response) => {
        console.log('✅ Report submitted:', response.message);
        this.isSubmitting.set(false);

        // Close dialog with success response
        this.dialogRef.close({
          success: true,
          message: response.message,
          reportId: response.reportId,
        });
      },
      error: (error) => {
        console.error('❌ Failed to submit report:', error.message);
        this.isSubmitting.set(false);
        this.errorMessage.set(error.message || 'Failed to submit report. Please try again.');

        // Go back to form on error
        this.showConfirmation.set(false);
      },
    });
  }

  isReasonValid(): boolean {
    return this.reportService.isReasonValid(this.reason());
  }

  isSubmitDisabled(): boolean {
    return !this.isReasonValid() || this.isSubmitting();
  }

  cancelConfirmation(): void {
    this.showConfirmation.set(false);
  }

  getCharacterCount(): number {
    return this.reportService.getCharacterCount(this.reason());
  }

  getCounterColor(): string {
    const count = this.getCharacterCount();
    if (count < this.MIN_LENGTH) {
      return '#EA0027'; // Red - too short
    } else if (count > this.MAX_LENGTH - 50) {
      return '#FF8B00'; // Orange - getting close to limit
    } else {
      return '#7C7C7C'; // Gray - good
    }
  }

  getValidationError(): string | null {
    const validation = this.reportService.validateReason(this.reason());
    return validation.valid ? null : validation.error || null;
  }
}
