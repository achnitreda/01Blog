export interface Notification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;

  actorId: number;
  actorUsername: string;

  postId: number;
  postTitle: string;

  createdAt: string;
}

export enum NotificationType {
  NEW_POST = 'NEW_POST',
}
