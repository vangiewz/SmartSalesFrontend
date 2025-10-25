// src/lib/client.ts
import axios from "axios";

// Alterna manualmente entre local y producción
const USE_PROD = true; // Cambia a true para producción
const BASE_URLS = {
  local: "http://127.0.0.1:8000/api/",
  prod: "https://smartsalesbackend.onrender.com/api/",
};

export const api = axios.create({
  baseURL: USE_PROD ? BASE_URLS.prod : BASE_URLS.local,
  withCredentials: false, // no usamos cookies; tokens por header
});

// ⬇️ INYECTAR TOKEN EN CADA REQUEST (excepto login/register/password-reset)
api.interceptors.request.use((config) => {
  const url = String(config.url || "");
  const isPublic =
    url.startsWith("login/") ||
    url.startsWith("register/") ||
    url.startsWith("password-reset/");

  if (!isPublic) {
    // 👇 Protege el acceso en entorno de servidor (Vercel build o SSR)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// (Opcional) manejar 401/403 globalmente
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      // si quieres, limpia tokens aquí:
      // localStorage.removeItem("access_token");
      // localStorage.removeItem("refresh_token");
    }
    return Promise.reject(err);
  }
);

// Tipos compatibles con tu backend
export type AuthUser = {
  id: string | null;
  correo: string | null;
  nombre: string | null;
  telefono: string | null;
  roles: string[];
  roles_ids?: number[];
  is_admin?: boolean;
  is_vendedor?: boolean;
  is_analista?: boolean;
  is_cliente?: boolean;
};

export type Tokens = {
  access: string;
  refresh?: string;
  token_type?: string;
  expires_in?: number;
};
