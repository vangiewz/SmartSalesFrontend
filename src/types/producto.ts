// src/types/producto.ts

export interface Marca {
  id: number
  nombre: string
}

export interface TipoProducto {
  id: number
  nombre: string
}

export interface Producto {
  id: number
  id_vendedor: string
  imagen_key: string
  imagen_url: string
  nombre: string
  precio: number
  stock: number
  tiempogarantia: number
  marca_id: number
  tipoproducto_id: number
}

export interface ProductoFormData {
  nombre: string
  precio: number
  stock: number
  tiempogarantia: number
  marca_id: number
  tipoproducto_id: number
  imagen?: File
}

export interface ProductosResponse {
  count: number
  page: number
  page_size: number
  results: Producto[]
}

export interface ProductoFilters {
  q?: string
  marca_id?: number
  tipoproducto_id?: number
  min_precio?: number
  max_precio?: number
  page?: number
  page_size?: number
}
