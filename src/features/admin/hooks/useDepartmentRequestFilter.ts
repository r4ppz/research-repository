import { useMemo } from "react";
import { useAuth } from "@/features/auth/context/useAuth";
import { DocumentRequest } from "@/types";

/**
 * Custom hook for filtering document requests based on user role and department
 * Super admins can see all PENDING requests
 * Department admins can only see PENDING requests related to their department
 * @param requests The array of document requests to filter
 * @returns Filtered array of document requests based on user role and department
 */
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
