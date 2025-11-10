// src/services/gestionCatalogos.ts
import { api } from '../lib/client'

// ============================================
// INTERFACES
// ============================================

export interface TipoProducto {
  id: number
  nombre: string
}

export interface Marca {
  id: number
  nombre: string
}

export interface CrearCatalogoDto {
  nombre: string
}

// ============================================
// TIPOS DE PRODUCTO
// ============================================

export async function listarTiposProducto(): Promise<TipoProducto[]> {
  const { data } = await api.get('gestion-catalogos/tipos-producto/')
  return data
}

export async function crearTipoProducto(dto: CrearCatalogoDto): Promise<TipoProducto> {
  const { data } = await api.post('gestion-catalogos/tipos-producto/crear/', dto)
  return data
}

export async function actualizarTipoProducto(
  id: number,
  dto: CrearCatalogoDto
): Promise<TipoProducto> {
  const { data } = await api.put(`gestion-catalogos/tipos-producto/${id}/`, dto)
  return data
}

export async function eliminarTipoProducto(id: number): Promise<{ detail: string }> {
  const { data } = await api.delete(`gestion-catalogos/tipos-producto/${id}/eliminar/`)
  return data
}

// ============================================
// MARCAS
// ============================================

export async function listarMarcas(): Promise<Marca[]> {
  const { data } = await api.get('gestion-catalogos/marcas/')
  return data
}

export async function crearMarca(dto: CrearCatalogoDto): Promise<Marca> {
  const { data } = await api.post('gestion-catalogos/marcas/crear/', dto)
  return data
}

export async function actualizarMarca(
  id: number,
  dto: CrearCatalogoDto
): Promise<Marca> {
  const { data } = await api.put(`gestion-catalogos/marcas/${id}/`, dto)
  return data
}

export async function eliminarMarca(id: number): Promise<{ detail: string }> {
  const { data } = await api.delete(`gestion-catalogos/marcas/${id}/eliminar/`)
  return data
}

// ============================================
// HELPER PARA MANEJAR ERRORES
// ============================================

export function getCatalogoError(error: unknown): string {
  const err = error as {
    response?: {
      data?: { detail?: string; message?: string }
      status?: number
    }
    message?: string
  }

  if (err?.response?.status === 404) {
    return 'No se encontró el registro solicitado'
  }

  if (err?.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción. Solo los Administradores pueden gestionar catálogos.'
  }

  if (err?.response?.status === 401) {
    return 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
  }

  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'Ocurrió un error inesperado'
  )
}
