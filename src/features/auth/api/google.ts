import axiosClient from "@/api/axiosClient";
import { AuthResponse } from "@/types";

export const loginWithGoogle = async (code: string): Promise<AuthResponse> => {
  const response = await axiosClient.post<AuthResponse>("/api/auth/google", { code });
  return response.data;
};
