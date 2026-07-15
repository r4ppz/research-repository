import { axiosClient } from "@/api/axiosClient";
import type { Page, User } from "@/types";

export interface AdminUsersQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface ChangeUserRoleRequest {
  role: User["role"];
  departmentId?: number;
}

export const getAdminUsers = async (params?: AdminUsersQueryParams): Promise<Page<User>> => {
  const response = await axiosClient.get<Page<User>>("/api/admin/users", { params });
  return response.data;
};

export interface CreateUserRequest {
  email: string;
  role: User["role"];
  departmentId?: number;
}

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await axiosClient.post<User>("/api/admin/users", data);
  return response.data;
};

export const changeUserRole = async (
  userId: number,
  role: User["role"],
  departmentId?: number,
): Promise<User> => {
  const response = await axiosClient.put<User>(`/api/admin/users/${String(userId)}/role`, {
    role,
    departmentId,
  });

  return response.data;
};
