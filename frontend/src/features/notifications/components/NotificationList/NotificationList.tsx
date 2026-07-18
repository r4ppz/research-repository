import type { ReactNode } from "react";
import { useCallback, useRef } from "react";
import style from "./NotificationList.module.css";
import type { NotificationDto } from "@/types";
import { useTick } from "../../hooks/useTick";

function renderMessage(message: string): ReactNode {
  const idx = message.lastIndexOf(" from ");
  if (idx === -1) return message;
  return (
    <>
      {message.slice(0, idx)}
      {" from "}
      <strong>{message.slice(idx + 6)}</strong>
    </>
  );
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

interface NotificationListProps {
  notifications: NotificationDto[];
  isLoading: boolean;
  error: Error | null;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onNotificationClick: (notification: NotificationDto) => void;
}

export const NotificationList = ({
  notifications,
  isLoading,
  error,
  isFetchingNextPage,
  hasNextPage,
  totalCount,
  onLoadMore,
  onNotificationClick,
}: NotificationListProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  useTick(60_000);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) {
            onLoadMore();
          }
        },
        { root: containerRef.current },
      );
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, onLoadMore],
  );

  if (isLoading) {
    return (
      <div className={style.container}>
        <p className={style.statusText}>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.container}>
        <p className={style.statusText}>Failed to load notifications: {error.message}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={style.container}>
        <p className={style.statusText}>No notifications yet.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={style.container}>
      <div className={style.countBar}>
        <span className={style.countText}>
          Showing {notifications.length}
          {totalCount > 0 && <> of {totalCount}</>}
        </span>
      </div>

      {notifications.map((notification, index) => {
        const isLast = index === notifications.length - 1;
        return (
          <div
            key={notification.notificationId}
            ref={isLast ? lastItemRef : undefined}
            className={style.item}
            role="button"
            tabIndex={0}
            onClick={() => {
              onNotificationClick(notification);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNotificationClick(notification);
              }
            }}
          >
            <div className={style.itemContent}>
              <p className={style.message}>{renderMessage(notification.message)}</p>
              <span className={style.time}>{timeAgo(notification.createdAt)}</span>
            </div>
            {!notification.isRead && <span className={style.unreadDot} />}
          </div>
        );
      })}

      {isFetchingNextPage && <p className={style.statusText}>Loading more...</p>}
    </div>
  );
};
