export interface Comment {
  id: number;
  content: string;
  authorId: number;
  authorUsername: string;
  postId: number;
  createdAt: string; // ISO format from backend
}

export interface CreateCommentRequest {
  content: string;
}
