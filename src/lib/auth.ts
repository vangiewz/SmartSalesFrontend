// src/lib/auth.ts
import { api, type AuthUser, type Tokens } from "./client";

function getErr(err: any): Error {
  const d = err?.response?.data;
  const msg =
    (typeof d === "string" && d) ||
    d?.detail ||
    d?.message ||
    (err?.message as string) ||
    "Error de red";
  return new Error(msg);
}

export async function apiRegister(payload: {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
}): Promise<{ user: AuthUser; tokens: Tokens }> {
  try {
    const { data } = await api.post("register/", payload);
    localStorage.setItem("access_token", data.tokens.access);
    if (data.tokens.refresh) localStorage.setItem("refresh_token", data.tokens.refresh);
    return data;
  } catch (e) {
    throw getErr(e);
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ user: AuthUser; tokens: Tokens }> {
  try {
    const { data } = await api.post("login/", { email, password });
    localStorage.setItem("access_token", data.tokens.access);
    if (data.tokens.refresh) localStorage.setItem("refresh_token", data.tokens.refresh);
    return data;
  } catch (e) {
    throw getErr(e);
  }
}

export async function apiMe(): Promise<AuthUser> {
  try {
    const { data } = await api.get("me/");
    return data as AuthUser;
  } catch (e) {
    throw getErr(e);
  }
}

export function apiLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
