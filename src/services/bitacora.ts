// src/services/bitacora.ts
import { api } from "../lib/client";
import { getApiError } from "./api";

export type BitacoraEntry = {
  id: number;
  tabla: string;
  operacion: string;
  fecha: string;              // ISO string
  usuario_id: string | null;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
};

export async function getBitacora(): Promise<BitacoraEntry[]> {
  try {
    const res = await api.get<BitacoraEntry[]>("/bitacora/");
    return res.data;
  } catch (error) {
    // Reusamos tu manejador de errores
    throw new Error(getApiError(error));
  }
}
