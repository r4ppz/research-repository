import { useState, useCallback, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type User } from "@/types";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
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

export default AuthProvider;
