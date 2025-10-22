// src/types/catalogo.ts

export interface ProductoCatalogo {
  id: number
  nombre: string
  precio: number
  stock: number
  tiempogarantia: number
  imagen_url: string | null
  marca: {
    id: number
    nombre: string
  }
  tipoproducto: {
    id: number
    nombre: string
  }
  vendedor: {
    id: string
    nombre: string
    correo: string
  }
}

export interface CatalogoProductosResponse {
  total: number
  page: number
  page_size: number
  total_pages: number
  results: ProductoCatalogo[]
}

export interface FiltrosDisponibles {
  marcas: Array<{ id: number; nombre: string }>
  tipos: Array<{ id: number; nombre: string }>
}

export interface CatalogoFilters {
  q?: string
  marca_id?: number
  tipoproducto_id?: number
  min_precio?: number
  max_precio?: number
  min_stock?: number
  max_stock?: number
  page?: number
  page_size?: number
}
