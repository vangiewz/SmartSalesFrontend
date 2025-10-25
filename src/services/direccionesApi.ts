// src/services/direccionesApi.ts

import { api } from '../lib/client';

export interface Direccion {
  id?: number;
  direccion: string; // Campo único de texto plano
}

export const getDirecciones = async (): Promise<Direccion[]> => {
  const response = await api.get('direcciones/');
  return response.data;
};

export const createDireccion = async (direccion: string): Promise<Direccion> => {
  const response = await api.post('direcciones/', { direccion });
  return response.data;
};

export const updateDireccion = async (id: number, direccion: string): Promise<Direccion> => {
  const response = await api.put(`direcciones/${id}/`, { direccion });
  return response.data;
};

export const deleteDireccion = async (id: number): Promise<void> => {
  await api.delete(`direcciones/${id}/`);
};
