// src/services/garantiaApi.ts

import { api } from '../lib/client';
import type {
  GarantiaClaim,
  CreateGarantiaRequest,
  EvaluateGarantiaRequest,
  GarantiaFilters,
  VentaElegible,
  GarantiaDetalle,
} from '../types/garantia';

/**
 * Obtener ventas elegibles para garantía (solo productos con garantía vigente)
 */
export const getVentasElegibles = async (): Promise<VentaElegible[]> => {
  const response = await api.get<VentaElegible[]>('garantia/ventas-elegibles/');
  return response.data;
};

/**
 * Listar mis garantías (solo del usuario autenticado)
 */
export const getMisGarantias = async (filters?: GarantiaFilters): Promise<GarantiaClaim[]> => {
  const params: Record<string, string | number | undefined> = {};
  
  if (filters?.estado) params.estado = filters.estado;
  if (filters?.q) params.q = filters.q;
  if (filters?.desde) params.desde = filters.desde;
  if (filters?.hasta) params.hasta = filters.hasta;
  if (filters?.page) params.page = filters.page;
  if (filters?.page_size) params.page_size = filters.page_size;

  const response = await api.get<GarantiaClaim[]>('garantia/mis/', { params });
  return response.data;
};

/**
 * Listar todas las garantías (solo técnicos/administradores)
 */
export const getGarantiasGestionar = async (filters?: GarantiaFilters): Promise<GarantiaClaim[]> => {
  const params: Record<string, string | number | undefined> = {};
  
  if (filters?.estado) params.estado = filters.estado;
  if (filters?.venta_id) params.venta_id = filters.venta_id;
  if (filters?.producto_id) params.producto_id = filters.producto_id;
  if (filters?.q) params.q = filters.q;
  if (filters?.cliente) params.cliente = filters.cliente;
  if (filters?.desde) params.desde = filters.desde;
  if (filters?.hasta) params.hasta = filters.hasta;
  if (filters?.page) params.page = filters.page;
  if (filters?.page_size) params.page_size = filters.page_size;

  const response = await api.get<GarantiaClaim[]>('garantia/gestionar/', { params });
  return response.data;
};

/**
 * Crear un nuevo reclamo de garantía
 */
export const createGarantia = async (data: CreateGarantiaRequest): Promise<GarantiaClaim> => {
  const response = await api.post<GarantiaClaim>('garantia/crear/', data);
  return response.data;
};

/**
 * Evaluar un reclamo de garantía (solo técnicos)
 */
export const evaluateGarantia = async (
  garantia_id: number,
  data: EvaluateGarantiaRequest
): Promise<GarantiaClaim> => {
  const response = await api.post<GarantiaClaim>(
    `garantia/evaluar/${garantia_id}/`,
    data
  );
  return response.data;
};

/**
 * Obtener detalle de una garantía específica
 */
export const getGarantiaDetalle = async (
  venta_id: number,
  producto_id: number,
  garantia_id: number
): Promise<GarantiaDetalle> => {
  const response = await api.get<GarantiaDetalle>(
    `garantia/detalle/${venta_id}/${producto_id}/${garantia_id}/`
  );
  return response.data;
};
