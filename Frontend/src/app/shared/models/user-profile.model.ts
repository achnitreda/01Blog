export interface UserProfileModel {
  userId: number;
  username: string;
  email?: string;
  role: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isOwnProfile: boolean;
  joinedAt: string;
}
