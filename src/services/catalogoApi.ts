// src/services/catalogoApi.ts
import { api } from '../lib/client'
import type { 
  CatalogoProductosResponse,
  FiltrosDisponibles,
  CatalogoFilters
} from '../types/catalogo'

const API_BASE = '/listadoproductos'

// Helper para construir URL completa de imagen
export function getImagenUrl(imagenUrl: string | null): string {
  if (!imagenUrl) {
    return '/placeholder-product.png'
  }
  
  // Si ya es una URL completa (empieza con http), devolverla tal cual
  if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
    return imagenUrl
  }
  
  // Si es una ruta relativa, construir URL completa
  const baseURL = api.defaults.baseURL || 'http://127.0.0.1:8000/api/'
  // Remover '/api/' del final de baseURL para obtener solo el dominio
  const domain = baseURL.replace(/\/api\/?$/, '')
  
  // Asegurar que la imagenUrl empiece con /
  const path = imagenUrl.startsWith('/') ? imagenUrl : `/${imagenUrl}`
  
  const fullUrl = `${domain}${path}`
  
  // Debug: mostrar en consola (puedes remover esto después)
  console.log('🖼️ Imagen URL:', { original: imagenUrl, domain, path, fullUrl })
  
  return fullUrl
}

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

// ==============================
// NUEVAS FUNCIONALIDADES: IMPORTAR/EXPORTAR
// ==============================

// Tipos para importar/exportar
export interface ImportarResultado {
  total_procesados: number
  exitosos: number
  fallidos: number
  errores: Array<{
    fila: number
    error: string
    datos: Record<string, unknown>
  }>
  productos_creados: Array<{
    id: number
    nombre: string
    precio: number
    stock: number
    fila: number
  }>
}

// Descargar plantilla Excel
export const descargarPlantilla = async (): Promise<void> => {
  const response = await api.get('catalogo/descargar-plantilla/', {
    responseType: 'blob'
  })

  // Crear link de descarga
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  const fecha = new Date().toISOString().split('T')[0]
  link.setAttribute('download', `plantilla_catalogo_productos_${fecha}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Importar catálogo desde Excel
export const importarCatalogo = async (archivo: File): Promise<ImportarResultado> => {
  const formData = new FormData()
  formData.append('archivo', archivo)

  const response = await api.post('catalogo/importar/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

// Exportar catálogo a Excel
export const exportarCatalogo = async (): Promise<void> => {
  const response = await api.get('catalogo/exportar/', {
    responseType: 'blob'
  })

  // Crear link de descarga
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  const fecha = new Date().toISOString().split('T')[0]
  link.setAttribute('download', `mi_catalogo_${fecha}.xlsx`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
