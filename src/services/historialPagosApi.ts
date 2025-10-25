// src/services/historialPagosApi.ts

import { api } from '../lib/client';
import type { HistorialPago } from '../types/historialPagos';

export const getHistorialPagos = async (): Promise<HistorialPago[]> => {
  const response = await api.get<HistorialPago[]>('historial-pagos/');
  return response.data;
};
