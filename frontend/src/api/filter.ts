import { axiosClient } from "@/api/axiosClient";
import type { Department } from "@/types";

interface YearsResponse {
  years: number[];
}

interface DepartmentsResponse {
  departments: Department[];
}

export const getYears = async (): Promise<number[]> => {
  const response = await axiosClient.get<YearsResponse>("/api/filters/years");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return response.data?.years ?? [];
};

export const getDepartments = async (): Promise<Department[]> => {
  const response = await axiosClient.get<DepartmentsResponse>("/api/filters/departments");
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return response.data?.departments ?? [];
};
