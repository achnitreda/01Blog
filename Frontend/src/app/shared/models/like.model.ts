export interface LikeResponse {
  postId: number;
  userId: number;
  username: string;
  likedAt: string; // ISO date string
}

/**
 * Post Likes Response - List of users who liked a post
 */
export interface PostLikesResponse {
  postId: number;
  likes: LikeResponse[];
  totalCount: number;
}
