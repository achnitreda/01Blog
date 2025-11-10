export interface AdminPost {
  id: number;
  title: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;

  authorId: number;
  authorUsername: string;
  authorBanned: boolean;

  likesCount: number;
  commentsCount: number;

  hidden: boolean;
  hiddenReason: string | null;
  hiddenAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface HidePostRequest {
  reason: string;
}

export interface DeletePostResponse {
  message: string;
}
