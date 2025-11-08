// src/services/ventasHistoricas.ts
import { api } from "../lib/client";

export type GroupBy = "periodo" | "producto" | "cliente";
export type Granularity = "day" | "week" | "month" | "quarter" | "year";
export type Metric = "total" | "cantidad" | "ticket_promedio";

export interface Meta {
  group_by: GroupBy;
  granularity?: Granularity | null;
  from: string | null;
  to: string | null;
  count: number;
  generated_at: string;
}

export interface PeriodoRow {
  period: string;
  total: number;
  cantidad: number;
  ticket_promedio: number;
}

export interface ProductoRow {
  producto_id: number;
  producto: string;
  cantidad: number;
  total: number;
}

export interface ClienteRow {
  cliente_id: string;
  cliente: string;
  cantidad: number;
  total: number;
}

export interface HistoricoResponse<T = any> {
  meta: Meta;
  data: T[];
}

// Endpoints relativos a baseURL del client (que YA incluye /api/)
export const EP_RECOMMENDED = "ventas-historicas/historico/";
export const EP_LEGACY = "ventas-historicas/api/historico/";

function buildParams(params: Record<string, any>) {
  const clean: Record<string, any> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    clean[k] = v;
  });
  return clean;
}

export async function fetchHistorico(params: {
  group_by: GroupBy;
  granularity?: Granularity;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}): Promise<HistoricoResponse> {
  const query = buildParams(params);
  try {
    const { data } = await api.get<HistoricoResponse>(EP_RECOMMENDED, {
      params: query,
    });
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const { data } = await api.get<HistoricoResponse>(EP_LEGACY, {
        params: query,
      });
      return data;
    }
    throw err;
  }
}
