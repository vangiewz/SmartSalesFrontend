// src/services/productosApi.ts
import { api } from '../lib/client'
import type { 
  Marca, 
  TipoProducto, 
  Producto, 
  ProductoFormData, 
  ProductosResponse, 
  ProductoFilters 
} from '../types/producto'

const API_BASE = '/gestionproducto'

// Obtener marcas
export async function getMarcas(): Promise<Marca[]> {
  const response = await api.get(`${API_BASE}/marcas/`)
  return response.data
}

// Obtener tipos de producto
export async function getTipos(): Promise<TipoProducto[]> {
  const response = await api.get(`${API_BASE}/tipos/`)
  return response.data
}

// Listar productos con filtros y paginación
export async function getProductos(filters: ProductoFilters = {}): Promise<ProductosResponse> {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  const response = await api.get(`${API_BASE}/?${params}`)
  return response.data
}

// Obtener detalle de un producto
export async function getProducto(id: number): Promise<Producto> {
  const response = await api.get(`${API_BASE}/${id}/`)
  return response.data
}

// Crear producto
export async function createProducto(data: ProductoFormData): Promise<Producto> {
  const formData = new FormData()
  
  formData.append('nombre', data.nombre)
  formData.append('precio', data.precio.toString())
  formData.append('stock', data.stock.toString())
  formData.append('tiempogarantia', data.tiempogarantia.toString())
  formData.append('marca_id', data.marca_id.toString())
  formData.append('tipoproducto_id', data.tipoproducto_id.toString())
  
  if (data.imagen) {
    formData.append('imagen', data.imagen)
  }
  
  const response = await api.post(`${API_BASE}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}

// Actualizar producto
export async function updateProducto(
  id: number, 
  data: Partial<ProductoFormData>
): Promise<Producto> {
  const formData = new FormData()
  
  if (data.nombre) formData.append('nombre', data.nombre)
  if (data.precio !== undefined) formData.append('precio', data.precio.toString())
  if (data.stock !== undefined) formData.append('stock', data.stock.toString())
  if (data.tiempogarantia !== undefined) formData.append('tiempogarantia', data.tiempogarantia.toString())
  if (data.marca_id) formData.append('marca_id', data.marca_id.toString())
  if (data.tipoproducto_id) formData.append('tipoproducto_id', data.tipoproducto_id.toString())
  if (data.imagen) formData.append('imagen', data.imagen)
  
  const response = await api.patch(`${API_BASE}/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}

// Eliminar producto
export async function deleteProducto(id: number): Promise<void> {
  await api.delete(`${API_BASE}/${id}/`)
}

// Helper para obtener errores de API
export function getProductoApiError(error: unknown): string {
  const err = error as { response?: { data?: { detail?: string; error?: string }; status?: number } }
  
  if (err.response?.status === 409) {
    return 'No se puede eliminar: el producto tiene ventas asociadas'
  }
  
  if (err.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción'
  }
  
  if (err.response?.status === 404) {
    return 'Producto no encontrado'
  }
  
  return err.response?.data?.detail || 
         err.response?.data?.error || 
         'Error al procesar la solicitud'
}
