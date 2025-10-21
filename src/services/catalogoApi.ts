// src/services/catalogoApi.ts
import { api } from '../lib/client'
import type { 
  CatalogoProductosResponse,
  FiltrosDisponibles,
  CatalogoFilters
} from '../types/catalogo'

const API_BASE = '/listadoproductos'

// Obtener filtros disponibles (marcas y tipos)
export async function getFiltrosDisponibles(): Promise<FiltrosDisponibles> {
  const response = await api.get(`${API_BASE}/filtros/`)
  return response.data
}

// Listar productos del catálogo con filtros
export async function getProductosCatalogo(filters: CatalogoFilters = {}): Promise<CatalogoProductosResponse> {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  const response = await api.get(`${API_BASE}/?${params}`)
  return response.data
}

// Helper para obtener el estado del producto basado en stock
export function getEstadoProducto(stock: number) {
  if (stock <= 0) {
    return {
      label: 'Agotado',
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-white'
    }
  }
  return {
    label: 'Disponible',
    bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
    textColor: 'text-white'
  }
}

// Helper para formatear precio
export function formatearPrecio(precio: number): string {
  return `$ ${precio.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}
