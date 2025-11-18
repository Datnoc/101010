"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  alpacaAccountId?: string; // Her kullanıcının Alpaca account ID'si
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini yükle
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("mambu_token");
      const savedUser = localStorage.getItem("mambu_user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("mambu_token");
          localStorage.removeItem("mambu_user");
        }
      }
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("mambu_token", newToken);
    localStorage.setItem("mambu_user", JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      // Logout API'ye istek gönder (opsiyonel)
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Her durumda localStorage'ı temizle
      setToken(null);
      setUser(null);
      localStorage.removeItem("mambu_token");
      localStorage.removeItem("mambu_user");
      
      // Ana sayfaya yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

