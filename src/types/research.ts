import { type Department, type User } from "./user";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ResearchPaper {
  paperId: number;
  title: string;
  authorName: string;
  abstractText: string;
  department: Department;
  submissionDate: string; // YYYY-MM-DD
  fileUrl: string; // API path (gated), e.g. /api/files/uuid.pdf
  archived: boolean;
  archivedAt?: string | null; // ISO datetime when archived (optional)
}

export interface DocumentRequest {
  requestId: number;
  status: RequestStatus;
  requestDate: string; // ISO datetime
  paper: ResearchPaper;
  requester: User;
}
