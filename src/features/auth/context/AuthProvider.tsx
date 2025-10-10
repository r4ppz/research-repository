import { useState, useCallback, type ReactNode } from "react";
import { type User } from "@/types";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((newUser: User) => setUser(newUser), []);
  const logout = useCallback(() => setUser(null), []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
