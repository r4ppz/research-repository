import axios from "axios";
import { AuthResponse } from "@/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000/api";

export const authApi = {
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/google`, { credential });
    return response.data;
  },
};
