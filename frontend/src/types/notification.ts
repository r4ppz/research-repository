export interface NotificationDto {
  notificationId: number;
  message: string;
  type: "NEW_REQUEST" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED";
  relatedRequestId: number | null;
  isRead: boolean;
  createdAt: string;
}

