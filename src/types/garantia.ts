// src/types/garantia.ts

export type EstadoGarantia = "Pendiente" | "Completado" | "Rechazado";

export interface GarantiaClaim {
  venta_id: number;
  producto_id: number;
  garantia_id: number;
  estado: EstadoGarantia;
  cantidad: number;
  motivo: string;
  // Nombres antiguos (compatibilidad)
  hora?: string | null;          // ISO 8601, fecha del reclamo
  reemplazo?: boolean | null;    // true = reemplazo, false = reparado, null = rechazado o pendiente
  limitegarantia?: string;       // ISO 8601, fecha límite de garantía
  // Nombres nuevos del backend
  fecha_solicitud?: string | null;
  es_reemplazo?: boolean | null;
  limite_garantia?: string;
  // Info del producto
  producto_nombre: string;
  producto_imagen_url: string;
}

export interface GarantiaListResponse {
  count: number;
  page: number;
  page_size: number;
  results: GarantiaClaim[];
}

export interface CreateGarantiaRequest {
  venta_id: number;
  producto_id: number;
  cantidad: number;
  motivo: string;
}

export interface EvaluateGarantiaRequest {
  evaluacion?: "Reparar" | "Reemplazar" | "Rechazar";
  comentario_tecnico: string;
  reemplazo?: boolean | null; // Alternativa: true = reemplazo, false = reparado, null = rechazar
}

export interface GarantiaFilters {
  estado?: EstadoGarantia;
  venta_id?: number;
  producto_id?: number;
  q?: string;              // Búsqueda por nombre de producto
  cliente?: string;        // Búsqueda por correo de cliente (solo técnicos)
  desde?: string;          // ISO 8601
  hasta?: string;          // ISO 8601
  page?: number;
  page_size?: number;
}

// Nuevos tipos para ventas elegibles
export interface ProductoElegible {
  producto_id: number;
  producto_nombre: string;
  producto_imagen_url: string;
  cantidad_comprada: number;
  limitegarantia: string;  // ISO 8601
}

export interface VentaElegible {
  venta_id: number;
  fecha_venta: string;     // ISO 8601
  productos: ProductoElegible[];
}

// Detalle completo de garantía
export interface GarantiaDetalle {
  garantia_id: number;
  venta_id: number;
  producto_id: number;
  producto_nombre: string;
  producto_imagen_url: string;
  producto_descripcion: string;
  producto_garantia_dias: number;
  fecha_venta: string;           // ISO 8601
  fecha_solicitud: string;       // ISO 8601
  limite_garantia: string;       // ISO 8601
  estado: EstadoGarantia;
  motivo: string;
  cantidad: number;
  evaluacion: string | null;
  comentario_tecnico: string;
  fecha_evaluacion: string | null;  // ISO 8601
  tecnico_id: number | null;
  tecnico_nombre: string;
  es_reemplazo: boolean | null;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
}
