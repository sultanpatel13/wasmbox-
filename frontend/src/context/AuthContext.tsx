import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSession, createDemoSession, clearSession, type AuthSession } from "../services/auth";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (email: string) => AuthSession;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getSession();
    setSession(stored);
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newSession = createDemoSession(email);
    setSession(newSession);
    return newSession;
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}