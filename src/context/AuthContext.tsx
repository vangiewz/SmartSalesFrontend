import { createContext, useState, useEffect, type ReactNode } from "react";
import { apiLogin, apiRegister, apiLogout, apiMe } from "../lib/auth";
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

  // Persistir sesión: revisar token y cargar usuario al montar
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Si hay token, intenta cargar el usuario actual
      apiMe()
        .then(async (u) => {
          // cargar roles también si lo necesitas
          try {
            const rolesData = await getMyRoles();
            setUser({ ...u, ...rolesData });
          } catch {
            setUser(u);
          }
        })
        .catch(() => {
          setUser(null);
          apiLogout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const register = async (payload: { email: string; password: string; nombre: string; telefono?: string }) => {
    const { user } = await apiRegister(payload);
    try {
      const rolesData = await getMyRoles();
      setUser({ ...user, ...rolesData });
    } catch {
      setUser(user);
    }
  };

  const login = async (email: string, password: string) => {
    const { user } = await apiLogin(email, password);
    console.log('🔐 Login - Usuario básico:', user);
    try {
      const rolesData = await getMyRoles();
      console.log('🔐 Login - Roles obtenidos:', rolesData);
      const fullUser = { ...user, ...rolesData };
      console.log('🔐 Login - Usuario completo:', fullUser);
      setUser(fullUser);
    } catch (error) {
      console.error('❌ Error al obtener roles:', error);
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