import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import style from "./NotificationPage.module.css";
import { getNotifications } from "@/api/notifications";
import { Button } from "@/components/common/Button/Button";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { useAuth } from "@/features/auth/context/useAuth";
import { NotificationList } from "@/features/notifications/components/NotificationList/NotificationList";
import { useNotificationContext } from "@/features/notifications/context/NotificationContext";
import type { NotificationDto, Role } from "@/types";

const REQUEST_PATH: Record<Role, string> = {
  STUDENT: "/student/requests",
  FACULTY: "/faculty/requests",
  DEPARTMENT_ADMIN: "/department-admin/requests",
  SUPER_ADMIN: "/super-admin/requests",
};

export const NotificationPage = () => {
  const { user } = useAuth();
  const { markAllRead, markAsRead } = useNotificationContext();
  const navigate = useNavigate();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ["notifications"],
      queryFn: ({ pageParam }: { pageParam: number }) => getNotifications(pageParam, 20),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const next = lastPage.number + 1;
        return next < lastPage.totalPages ? next : undefined;
      },
    });

  const notifications = data?.pages.flatMap((page) => page.content) ?? [];
  const totalCount = data?.pages[0]?.totalElements ?? 0;

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!user) return;
    markAsRead(notification.notificationId, !notification.isRead);
    navigate(REQUEST_PATH[user.role]);
  };

  return (
    <div className={style.page}>
      <Header />
      <main className={style.main}>
        <div className={style.mainContainer}>
          <div className={style.headerRow}>
            <h1 className={style.title}>Notifications</h1>
            <Button
              variant="primary"
              type="button"
              className={style.markAllReadButton}
              onClick={() => void markAllRead()}
            >
              Mark all read
            </Button>
          </div>

          <NotificationList
            notifications={notifications}
            isLoading={isLoading}
            error={error}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            totalCount={totalCount}
            onLoadMore={() => void fetchNextPage()}
            onNotificationClick={handleNotificationClick}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};
