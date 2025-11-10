export interface DashboardStatistics {
  totalUsers: number;
  visiblePosts: number;
  bannedUsers: number;
  activeUsers: number;

  totalPosts: number;
  hiddenPosts: number;

  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

export interface ReportStatistics {
  total: number;
  pending: number;
  resolved: number;
}

export interface ResolveReportRequest {
  action: string;
}
