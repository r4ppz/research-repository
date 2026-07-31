import { axiosClient } from "@/api/axiosClient";
import type { NotificationDto } from "@/types";
import type { Page } from "@/types/api";

export const getNotifications = async (page: number, size = 20): Promise<Page<NotificationDto>> => {
  const response = await axiosClient.get<Page<NotificationDto>>("/api/notifications", {
    params: { page, size },
  });
  return response.data;
};

export const markAllRead = async (): Promise<void> => {
  await axiosClient.put("/api/notifications/mark-all-read");
};

export const markAsRead = async (notificationId: number): Promise<void> => {
  await axiosClient.put(`/api/notifications/${notificationId}/read`);
};
