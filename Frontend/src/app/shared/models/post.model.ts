export interface Post {
  id: number;
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  authorId: number;
  authorUsername: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreatePostRequest {
  title: string;
  content: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

/**
 * Media Type enum for type safety
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}
