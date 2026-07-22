export interface NotificationDto {
  notificationId: number;
  message: string;
  type: "NEW_REQUEST" | "REQUEST_ACCEPTED" | "REQUEST_REJECTED"
      | "NEW_SUBMISSION" | "SUBMISSION_APPROVED" | "SUBMISSION_REJECTED";
  relatedEntityId: number | null;
  relatedEntityType: "DOCUMENT_REQUEST" | "RESEARCH_PAPER" | null;
  isRead: boolean;
  createdAt: string;
}
