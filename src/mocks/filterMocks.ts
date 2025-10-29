import { type Department } from "@/types";
import { MOCK_PAPERS } from "./paperMocks";
import { MOCK_REQUESTS } from "./requestMocks";

// Static departments list for filtering
export const MOCK_DEPARTMENTS: Department[] = [
  { departmentId: 1, departmentName: "Computer Science" },
  { departmentId: 2, departmentName: "Information Technology" },
  { departmentId: 3, departmentName: "Physics" },
  { departmentId: 4, departmentName: "Mathematics" },
  { departmentId: 5, departmentName: "Biology" },
  { departmentId: 6, departmentName: "Business Administration" },
  { departmentId: 7, departmentName: "Psychology" },
  { departmentId: 8, departmentName: "Electrical Engineering" },
  { departmentId: 9, departmentName: "Environmental Science" },
  { departmentId: 10, departmentName: "Cybersecurity" },
];

// Extract unique years from MOCK_PAPERS submission dates
export const MOCK_YEARS = Array.from(
  new Set(MOCK_PAPERS.map((paper) => paper.submissionDate.substring(0, 4))),
)
  .sort()
  .reverse();

// Extract unique request dates from MOCK_REQUESTS
export const MOCK_REQUEST_DATES = Array.from(
  new Set(MOCK_REQUESTS.map((request) => request.requestDate.substring(0, 10))), // Extract date part (YYYY-MM-DD)
)
  .sort()
  .reverse();
