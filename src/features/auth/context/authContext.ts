import { createContext } from "react";
import type { GoogleUser } from "../api/googleAuth";

export interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  login: (user: GoogleUser) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
