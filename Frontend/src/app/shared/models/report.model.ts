export interface Report {
  id: number;
  reason: string;
  status: string;

  reporterId: number;
  reporterUsername: string;

  reportedUserId: number;
  reportedUsername: string;
  reportedUserBanned: boolean;

  resolvedById: number | null;
  resolvedByUsername: string | null;

  createdAt: string;
  resolvedAt: string | null;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

export interface ReportRequest {
  reason: string;
}

export interface ReportSubmitResponse {
  message: string;
  reportId: number;
}
