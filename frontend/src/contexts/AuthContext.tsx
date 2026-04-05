import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/api/axios";
import type { TokenResponse } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem("access_token")
  );
  const [userName, setUserName] = useState<string | null>(
    () => sessionStorage.getItem("user_name")
  );

  const login = useCallback(async (email: string, senha: string) => {
    const { data } = await api.post<TokenResponse>("/auth/login", {
      email,
      senha,
    });
    sessionStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem("refresh_token", data.refresh_token);

    // decode JWT payload to get user info
    const payload = JSON.parse(atob(data.access_token.split(".")[1]!));
    const name = payload.email as string;
    sessionStorage.setItem("user_name", name);
    setUserName(name);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");
    api
      .post("/auth/logout", {
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      .catch(() => {});
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUserName(null);
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, userName, login, logout }),
    [isAuthenticated, userName, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
