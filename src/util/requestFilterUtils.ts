import { type DocumentRequest } from "@/types";
import { formatDateShort } from "./formatDate";

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Extracts unique department options from user's requests
 * @param requests - Array of user's document requests
 * @returns Array of filter options for departments
 */
export const getRequestDepartmentOptions = (requests: DocumentRequest[]): FilterOption[] => {
  const uniqueDepartments = Array.from(
    new Set(requests.map((request) => request.paper.department.departmentName)),
  );

  return uniqueDepartments.map((deptName) => ({
    value: deptName,
    label: deptName,
  }));
};

/**
 * Extracts unique request date options from user's requests
 * @param requests - Array of user's document requests
 * @returns Array of filter options for request dates
 */
export const getRequestDateOptions = (requests: DocumentRequest[]): FilterOption[] => {
  const uniqueDates = Array.from(
    new Set(requests.map((request) => request.requestDate.substring(0, 10))), // Extract date part (YYYY-MM-DD)
  );

  return uniqueDates.map((date) => ({
    value: date,
    label: formatDateShort(date),
  }));
};
