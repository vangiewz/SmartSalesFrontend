// src/types/historialPagos.ts

export interface ProductoPago {
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface HistorialPago {
  pago_id: number;
  venta_id: number;
  total: number;
  fecha_pago: string;
  fecha_venta: string;
  direccion_envio: string;
  productos: ProductoPago[];
  receipt_url: string | null;
}
