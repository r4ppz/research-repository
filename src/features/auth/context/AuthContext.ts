import { createContext } from "react";
import { type User } from "@/types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
