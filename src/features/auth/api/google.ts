import axios from "axios";
import { AuthResponse } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_BASE_URL,
});

export const loginWithGoogle = async (code: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/auth/google", { code });
  return response.data;
};
