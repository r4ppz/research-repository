import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/useAuth";
import { DocumentRequest } from "@/types";

export function useDepartmentRequestFilter(requests: DocumentRequest[]): DocumentRequest[] {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return [];
    }

    // Super admins can see all PENDING requests
    if (user.role === "SUPER_ADMIN") {
      return requests.filter((request) => request.status === "PENDING");
    }

    // Department admins can only see PENDING requests related to their department
    if (user.role === "DEPARTMENT_ADMIN" && user.department) {
      return requests.filter(
        (request) =>
          request.paper.department.departmentId === user.department?.departmentId &&
          request.status === "PENDING",
      );
    }

    // For other roles (e.g., STUDENT), return empty array
    return [];
  }, [requests, user]);
}
