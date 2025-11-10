import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { Report } from '../../../shared/models';
import { Router } from '@angular/router';
import { ReportService } from '../../../core/services';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

type ReportFilter = 'all' | 'PENDING' | 'RESOLVED' | 'DISMISSED';

@Component({
  selector: 'app-admin-reports',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    TimeAgoPipe,
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss',
})
export class AdminReports implements OnInit {
  allReports = signal<Report[]>([]);
  currentFilter = signal<ReportFilter>('all');

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isActionLoading = signal<number | null>(null);

  filteredReports = computed(() => {
    let reports = this.allReports();

    const filter = this.currentFilter();
    if (filter !== 'all') {
      reports = reports.filter((r) => r.status === filter);
    }

    return reports;
  });

  displayedColumns: string[] = ['reporter', 'reportedUser', 'reason', 'status', 'date', 'actions'];

  constructor(
    private reportService: ReportService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.reportService.getAllReports().subscribe({
      next: (reports) => {
        this.allReports.set(reports);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to load reports');
      },
    });
  }

  setFilter(filter: ReportFilter): void {
    this.currentFilter.set(filter);
  }

  viewReporter(reporterId: number): void {
    this.router.navigate(['/users', reporterId]);
  }

  viewReportedUser(userId: number): void {
    this.router.navigate(['/users', userId]);
  }

  resolveAsResolved(report: Report): void {
    if (report.status !== 'PENDING') {
      return;
    }

    const confirmed = confirm(
      `Resolve this report as RESOLVED?\n\n` +
        `Reporter: @${report.reporterUsername}\n` +
        `Reported: @${report.reportedUsername}\n` +
        `Reason: "${report.reason}"\n\n` +
        `This means appropriate action was taken (user banned, post deleted, etc.)`,
    );

    if (!confirmed) {
      return;
    }

    this.resolveReport(report.id, 'RESOLVED');
  }

  dismissReport(report: Report): void {
    if (report.status !== 'PENDING') {
      return;
    }

    const confirmed = confirm(
      `Dismiss this report?\n\n` +
        `Reporter: @${report.reporterUsername}\n` +
        `Reported: @${report.reportedUsername}\n` +
        `Reason: "${report.reason}"\n\n` +
        `This means the report was reviewed but no action was needed.`,
    );

    if (!confirmed) {
      return;
    }

    this.resolveReport(report.id, 'DISMISSED');
  }

  private resolveReport(reportId: number, action: string): void {
    this.isActionLoading.set(reportId);

    this.reportService.resolveReport(reportId, action).subscribe({
      next: (updatedReport) => {
        this.allReports.update((reports) =>
          reports.map((r) => (r.id === updatedReport.id ? updatedReport : r)),
        );

        this.isActionLoading.set(null);
      },
      error: (error) => {
        this.isActionLoading.set(null);
        console.error(error.message || 'Failed to resolve report', 'error');
      },
    });
  }

  isReportActionLoading(reportId: number): boolean {
    return this.isActionLoading() === reportId;
  }

  isPending(report: Report): boolean {
    return report.status === 'PENDING';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'RESOLVED':
        return 'resolved';
      case 'DISMISSED':
        return 'dismissed';
      default:
        return '';
    }
  }

  getFilterCount(filter: ReportFilter): number {
    const reports = this.allReports();
    if (filter === 'all') return reports.length;
    return reports.filter((r) => r.status === filter).length;
  }

  truncateText(text: string, maxLength: number = 80): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  retry(): void {
    this.loadReports();
  }
}
