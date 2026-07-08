import { useEffect } from "react";
import { getCurrentUser } from "@/api/users";
import { useAuth } from "@/features/auth/context/useAuth";
import { extractApiError, isAuthError } from "@/util/errorHandler";

const ROLE_MESSAGE_KEY = "auth_message";
const ROLE_MESSAGE = "Your role was updated. Please log in again.";
const POLL_INTERVAL_MS = 60_000;

export function useRoleWatcher() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const checkRole = async () => {
      try {
        const latestUser = await getCurrentUser();
        if (!cancelled && latestUser.role !== user.role) {
          sessionStorage.setItem(ROLE_MESSAGE_KEY, ROLE_MESSAGE);
          await logout();
        }
      } catch (error) {
        const apiError = extractApiError(error);
        if (!cancelled && isAuthError(apiError)) {
          await logout();
        }
      }
    };

    void checkRole();
    const intervalId = window.setInterval(() => {
      void checkRole();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [logout, user]);
}
