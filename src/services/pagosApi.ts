// src/services/pagosApi.ts

import { api } from '../lib/client';

export interface CheckoutItem {
  producto_id: number;
  cantidad: number;
}

export interface IniciarCheckoutRequest {
  items: CheckoutItem[];
  id_direccion?: number;
  direccion_manual?: string;
}

export interface IniciarCheckoutResponse {
  clientSecret: string;       // ✅ camelCase (backend format)
  paymentIntentId: string;    // ✅ camelCase (backend format)
}

export interface ConfirmarPagoRequest {
  paymentIntentId: string;    // ✅ camelCase (backend format)
}

export interface ConfirmarPagoResponse {
  status: string;
  venta_id: number;           // ✅ snake_case (backend format)
  receipt_url: string;        // ✅ snake_case (backend format)
  message: string;
}

export const getStripePublicKey = async (): Promise<string> => {
  const response = await api.get('pagos/public-key/');
  // El backend puede devolver publicKey o public_key
  return response.data.publicKey || response.data.public_key;
};

export const iniciarCheckout = async (
  request: IniciarCheckoutRequest
): Promise<IniciarCheckoutResponse> => {
  const response = await api.post('pagos/iniciar-checkout/', request);
  
  // DEBUG: Log the raw response structure
  console.log('🔍 [pagosApi] Raw response:', response);
  console.log('🔍 [pagosApi] response.data:', response.data);
  console.log('🔍 [pagosApi] response.data keys:', Object.keys(response.data || {}));
  
  // Verify clientSecret exists (camelCase)
  if (!response.data?.clientSecret) {
    console.error('❌ [pagosApi] clientSecret NOT found in response.data');
    console.error('❌ [pagosApi] Full response.data:', JSON.stringify(response.data, null, 2));
  } else {
    console.log('✅ [pagosApi] clientSecret found:', response.data.clientSecret.substring(0, 20) + '...');
  }
  
  return response.data;
};

export const confirmarPago = async (
  request: ConfirmarPagoRequest
): Promise<ConfirmarPagoResponse> => {
  const response = await api.post('pagos/confirmar-pago/', request);
  return response.data;
};
