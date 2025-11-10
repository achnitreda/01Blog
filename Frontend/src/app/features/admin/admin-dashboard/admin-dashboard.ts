import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { DashboardStatistics, Report } from '../../../shared/models';
import { AdminService } from '../../../core/services/admin.service';
import { ReportService } from '../../../core/services';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    TimeAgoPipe,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  statistics = signal<DashboardStatistics | null>(null);
  recentReports = signal<Report[]>([]);

  isLoadingStats = signal(true);
  isLoadingReports = signal(true);
  statsError = signal<string | null>(null);
  reportsError = signal<string | null>(null);

  constructor(
    private adminService: AdminService,
    private reportService: ReportService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
    this.loadRecentReports();
  }

  loadStatistics(): void {
    this.isLoadingStats.set(true);
    this.statsError.set(null);

    this.adminService.getDashboardStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.isLoadingStats.set(false);
      },
      error: (error) => {
        console.error('Failed to load statistics:', error.message);
        this.isLoadingStats.set(false);
        this.statsError.set(error.message || 'Failed to load statistics');
      },
    });
  }

  loadRecentReports(): void {
    this.isLoadingReports.set(true);
    this.reportsError.set(null);

    this.reportService.getReportsByStatus('PENDING').subscribe({
      next: (reports) => {
        this.recentReports.set(reports.slice(0, 5));
        this.isLoadingReports.set(false);
      },
      error: (error) => {
        console.error('Failed to load recent reports:', error.message);
        this.isLoadingReports.set(false);
        this.reportsError.set(error.message || 'Failed to load reports');
      },
    });
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  goToPosts(): void {
    this.router.navigate(['/admin/posts']);
  }

  goToReports(): void {
    this.router.navigate(['/admin/reports']);
  }

  viewReport(reportId: number): void {
    // For now, just go to reports page
    // In the future, could open a dialog or detail view
    console.log('view report ', Number);
    this.router.navigate(['/admin/reports']);
  }

  retryStats(): void {
    this.loadStatistics();
  }

  retryReports(): void {
    this.loadRecentReports();
  }

  hasPendingReports(): boolean {
    const stats = this.statistics();
    return stats ? stats.pendingReports > 0 : false;
  }

  getActiveUsersPercentage(): number {
    const stats = this.statistics();
    if (!stats || stats.totalUsers === 0) return 0;
    return Math.round((stats.activeUsers / stats.totalUsers) * 100);
  }

  getVisiblePostsPercentage(): number {
    const stats = this.statistics();
    if (!stats || stats.totalPosts === 0) return 0;
    return Math.round((stats.visiblePosts / stats.totalPosts) * 100);
  }
}
