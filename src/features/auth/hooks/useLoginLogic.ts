import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthResponse } from "@/types";
import { loginWithGoogle } from "../api/google";
import { useAuth } from "../context/useAuth";

export interface UseLoginLogicReturn {
  handleGoogleLogin: (code: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

export const useLoginLogic = (): UseLoginLogicReturn => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGoogleLogin = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      const data: AuthResponse = await loginWithGoogle(code);
      loginWithToken(data.jwt, data.user);
      void navigate("/", { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";

      setError(errorMessage);
      console.error("Login failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    error,
    loading,
  };
};
