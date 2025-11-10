export interface AdminUser {
  userId: number;
  username: string;
  email: string;
  role: string;

  banned: boolean;
  banReason: string | null;
  bannedAt: string | null;

  postsCount: number;
  followersCount: number;
  followingCount: number;
  reportsCount: number;

  joinedAt: string;
}

export interface BanUserRequest {
  reason: string;
}

export interface DeleteUserResponse {
  message: string;
}
