import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useEffect, useRef } from "react";
import { postRefresh } from "@/api/auth";
import { useAuth } from "@/features/auth/context/useAuth";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/features/auth/context/tokenStore";

const BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UseNotificationStreamOptions {
  onNotification?: () => void;
  onReconnect?: () => void;
}

export function useNotificationStream(
  { onNotification, onReconnect }: UseNotificationStreamOptions = {},
) {
  const { user, logout } = useAuth();
  const abortRef = useRef<AbortController | null>(null);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    let reconnecting = false;

    const handleUnauthorized = async () => {
      if (cancelled || reconnecting) return;
      reconnecting = true;
      try {
        const data = await postRefresh();
        setAccessToken(data.accessToken);
        reconnecting = false;
        if (!cancelled) void connect();
      } catch {
        removeAccessToken();
        reconnecting = false;
        if (!cancelled) {
          await logout();
        }
      }
    };

    const connect = async () => {
      if (abortRef.current != null) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const token = getAccessToken();
      if (!token) return;

      try {
        await fetchEventSource(`${BASE_URL}/api/notifications/stream`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          onopen: async (response) => {
            if (response.status === 401) {
              await handleUnauthorized();
              return;
            }
            if (response.status !== 200) {
              throw new Error(`Unexpected status: ${response.status}`);
            }
          },
          onmessage(event) {
            if (event.event === "notification" && event.data) {
              try {
                const data = JSON.parse(event.data);
                if (data?.notificationId != null) {
                  onNotificationRef.current?.();
                }
              } catch {
                // skip malformed messages
              }
            }
          },
          onerror() {
            if (cancelled) return;
            throw new Error("SSE connection closed");
          },
        });
      } catch {
        // Only retry if this controller is still current (not superseded by a new connect())
        // and the tab is visible. When hidden, let the visibilitychange handler reconnect.
        if (
          !cancelled &&
          abortRef.current === controller &&
          document.visibilityState === "visible"
        ) {
          setTimeout(() => {
            if (!cancelled) void connect();
          }, 3000);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        void connect();
        onReconnectRef.current?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    void connect();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (abortRef.current != null) abortRef.current.abort();
    };
  }, [user, logout]);
}
