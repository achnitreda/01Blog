export interface FollowResponse {
  message: string;
  isFollowing: boolean;
  followerId: number;
  followerUsername: string;
  followingId: number;
  followingUsername: string;
  timestamp: string;
}
