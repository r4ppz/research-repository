import { createContext } from "react";
import { User } from "@/types";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; token: string; user: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; loading: boolean };

export interface AuthContextValue {
  state: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginWithToken: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
