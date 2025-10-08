import type { Department, User } from "./user";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ResearchPaper {
  paperId: number;
  title: string;
  authorName: string;
  abstractText: string;
  department: Department;
  submissionDate: string;
  fileUrl: string;
  archived: boolean;
  archivedAt?: string | null;
}

type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface DocumentRequest {
  requestId: number;
  status: RequestStatus;
  requestDate: string; // ISO datetime
  paper: ResearchPaper;
  requester: User;
}
