import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptRequest, rejectRequest } from "@/api/admin/requests";

export function useAcceptRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminRequests"] });
    },
  });
}
