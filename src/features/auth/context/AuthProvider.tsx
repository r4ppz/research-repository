import { ReactNode, useReducer } from "react";
import { User } from "@/types";
import { AuthAction, AuthContext, AuthContextValue, AuthState } from "./AuthContext";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        token: action.token,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return initialState;

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loginWithToken = (token: string, user: User) => {
    localStorage.setItem("token", token);
    dispatch({ type: "LOGIN_SUCCESS", token, user });
  };

  // For development/testing purposes - generates a temporary token
  const login = (user: User) => {
    const tempToken = `temp_token_${Date.now().toString()}_${Math.random().toString()}`;
    localStorage.setItem("token", tempToken);
    dispatch({ type: "LOGIN_SUCCESS", token: tempToken, user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", loading });
  };

  const value: AuthContextValue = {
    state,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loginWithToken,
    login,
    logout,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
