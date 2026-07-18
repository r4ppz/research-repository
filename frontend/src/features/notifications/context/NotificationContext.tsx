import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/api/axiosClient";
import { markAllRead as markAllReadApi, markAsRead as markAsReadApi } from "@/api/notifications";
import { useAuth } from "@/features/auth/context/useAuth";
import { useNotificationStream } from "@/features/notifications/hooks/useNotificationStream";

interface NotificationContextValue {
  unreadCount: number;
  markAllRead: () => Promise<void>;
  markAsRead: (notificationId: number, wasUnread: boolean) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      try {
        const response = await axiosClient.get<number>("/api/notifications/unread-count");
        setUnreadCount(response.data);
      } catch {
        // ignore
      }
    };

    void fetchCount();
  }, [user]);

  useNotificationStream({
    onNotification: useCallback(() => {
      setUnreadCount((prev) => prev + 1);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }, [queryClient]),
  });

  const markAllRead = useCallback(async () => {
    await markAllReadApi();
    setUnreadCount(0);
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  const markAsRead = useCallback(
    async (notificationId: number, wasUnread: boolean) => {
      await markAsReadApi(notificationId);
      // only decrement count if notification was unread, prevents badge desync
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [queryClient],
  );

  return (
    <NotificationContext.Provider value={{ unreadCount, markAllRead, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (context == null) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
