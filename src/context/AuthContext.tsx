// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiLogin, apiRegister, apiLogout } from "../lib/auth";
import type { AuthUser } from "../lib/client";
import { getMyRoles } from "../services/api";

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (payload: { email: string; password: string; nombre: string; telefono?: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const register = async (payload: { email: string; password: string; nombre: string; telefono?: string }) => {
    const { user } = await apiRegister(payload);
    
    // Cargar roles del usuario
    try {
      const rolesData = await getMyRoles();
      setUser({ ...user, ...rolesData });
    } catch {
      // Si falla la carga de roles, aún establecemos el usuario sin roles
      setUser(user);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await apiLogin(email, password);
    
    // Cargar roles del usuario
    try {
      const rolesData = await getMyRoles();
      setUser({ ...user, ...rolesData });
    } catch {
      // Si falla la carga de roles, aún establecemos el usuario sin roles
      setUser(user);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
