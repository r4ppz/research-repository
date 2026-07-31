import { axiosClient } from "@/api/axiosClient";
import type { Page } from "@/types/api";

export interface AdminDepartment {
  departmentId: number;
  departmentName: string;
  paperCount: number;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateRequest {
  departmentName: string;
}

export interface DepartmentUpdateRequest {
  departmentName: string;
}

export const getAdminDepartments = async (params?: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<Page<AdminDepartment>> => {
  const response = await axiosClient.get<Page<AdminDepartment>>("/api/admin/departments", {
    params,
  });
  return response.data;
};

export const createDepartment = async (data: DepartmentCreateRequest): Promise<AdminDepartment> => {
  const response = await axiosClient.post<AdminDepartment>("/api/admin/departments", data);
  return response.data;
};

export const updateDepartment = async (
  id: number,
  data: DepartmentUpdateRequest,
): Promise<AdminDepartment> => {
  const response = await axiosClient.put<AdminDepartment>(
    `/api/admin/departments/${String(id)}`,
    data,
  );
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/admin/departments/${String(id)}`);
};
