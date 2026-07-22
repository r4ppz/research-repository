import type { CreatePaperMetadata } from "@/api/admin/papers";
import { axiosClient } from "@/api/axiosClient";
import type { DocumentRequest, Page, ResearchPaper } from "@/types";

export interface GetPapersParams {
  search?: string;
  departmentId?: string;
  year?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  size?: number;
  archived?: boolean;
}

export const getPapers = async (params: GetPapersParams = {}): Promise<Page<ResearchPaper>> => {
  const response = await axiosClient.get<Page<ResearchPaper>>("/api/papers", {
    params,
  });
  return response.data;
};

export const getPaperById = async (id: number): Promise<ResearchPaper> => {
  const response = await axiosClient.get<ResearchPaper>(`/api/papers/${id.toString()}`);
  return response.data;
};

export const getMyPaperRequest = async (paperId: number): Promise<DocumentRequest> => {
  const response = await axiosClient.get<DocumentRequest>(
    `/api/papers/${paperId.toString()}/my-request`,
  );
  return response.data;
};

export const submitPaper = async (
  metadata: CreatePaperMetadata,
  file: File,
): Promise<ResearchPaper> => {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(metadata));
  formData.append("file", file);

  const response = await axiosClient.post<ResearchPaper>("/api/papers/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getMySubmissions = async (
  params: GetPapersParams = {},
): Promise<Page<ResearchPaper>> => {
  const response = await axiosClient.get<Page<ResearchPaper>>("/api/papers/my-submissions", {
    params,
  });
  return response.data;
};

export const updateSubmission = async (
  id: number,
  metadata: CreatePaperMetadata,
  file?: File | null,
): Promise<ResearchPaper> => {
  const formData = new FormData();
  formData.append("metadata", JSON.stringify(metadata));
  if (file) {
    formData.append("file", file);
  }

  const response = await axiosClient.put<ResearchPaper>(
    `/api/papers/submit/${id.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const deleteSubmission = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/papers/submit/${id.toString()}`);
};
