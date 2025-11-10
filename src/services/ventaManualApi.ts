// src/services/ventaManualApi.ts
import { api } from '../lib/client'

// ==================== TIPOS ====================

export interface ClienteInfo {
  usuario_id: string
  nombre: string
  correo: string
  telefono: string
}

export interface ProductoVenta {
  producto_id: number
  nombre: string
  precio: string
  stock: number
  marca: string
  tipo: string
  tiempo_garantia: number
}

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
  subtotal: number
  stock_disponible: number
  marca: string
  tipo: string
}

export interface Carrito {
  items: ItemCarrito[]
  total: number
  cantidad_items: number
}

export interface ProductoVentaRequest {
  producto_id: number
  cantidad: number
}

export interface RegistrarVentaRequest {
  cliente_correo: string
  productos: ProductoVentaRequest[]
  direccion: string
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
}

export interface VentaRegistrada {
  venta_id: number
  cliente_nombre: string
  cliente_correo: string
  total: string
  direccion: string
  metodo_pago: string
  fecha: string
  productos: Array<{
    producto_id: number
    nombre: string
    precio: string
    cantidad: number
    subtotal: string
  }>
  vendedor_nombre: string
  pago_id: number
}

// ==================== FUNCIONES EXISTENTES ====================

export const buscarClientePorCorreo = async (correo: string): Promise<ClienteInfo> => {
  const response = await api.get('venta-manual/buscar-cliente/', {
    params: { correo },
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

export const buscarProductosVenta = async (busqueda: string): Promise<ProductoVenta[]> => {
  const response = await api.get('venta-manual/buscar-producto/', {
    params: { busqueda },
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

export const registrarVentaManual = async (data: RegistrarVentaRequest): Promise<VentaRegistrada> => {
  const response = await api.post('venta-manual/registrar/', data, {
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

// ==================== 🆕 NUEVAS FUNCIONES DE CARRITO ====================

/**
 * Agregar un producto al carrito con cantidad específica
 * Valida stock automáticamente
 */
export const agregarAlCarrito = async (producto_id: number, cantidad: number): Promise<Carrito> => {
  const response = await api.post('venta-manual/carrito/agregar/', 
    { producto_id, cantidad },
    { headers: { 'X-Platform': 'mobile' } }
  )
  return response.data
}

/**
 * Obtener el carrito actual del vendedor
 */
export const obtenerCarrito = async (): Promise<Carrito> => {
  const response = await api.get('venta-manual/carrito/', {
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

/**
 * Actualizar la cantidad de un producto en el carrito
 * Valida stock automáticamente
 */
export const actualizarCantidadCarrito = async (producto_id: number, cantidad: number): Promise<Carrito> => {
  const response = await api.put('venta-manual/carrito/actualizar/', 
    { producto_id, cantidad },
    { headers: { 'X-Platform': 'mobile' } }
  )
  return response.data
}

/**
 * Eliminar un producto del carrito
 */
export const eliminarDelCarrito = async (producto_id: number): Promise<Carrito> => {
  const response = await api.delete(`venta-manual/carrito/eliminar/${producto_id}/`, {
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

/**
 * Vaciar completamente el carrito
 */
export const vaciarCarrito = async (): Promise<Carrito> => {
  const response = await api.delete('venta-manual/carrito/vaciar/', {
    headers: { 'X-Platform': 'mobile' }
  })
  return response.data
}

/**
 * Registrar venta usando los productos del carrito
 * Convierte el carrito en el formato requerido
 */
export const registrarVentaDesdeCarrito = async (
  cliente_correo: string,
  direccion: string,
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia',
  carrito: Carrito
): Promise<VentaRegistrada> => {
  const productos = carrito.items.map(item => ({
    producto_id: item.producto_id,
    cantidad: item.cantidad
  }))
  
  return registrarVentaManual({
    cliente_correo,
    productos,
    direccion,
    metodo_pago
  })
}
