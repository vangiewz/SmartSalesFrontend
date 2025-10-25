// src/components/StripeProvider.tsx

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { api } from '../lib/client';

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider = ({ children }: StripeProviderProps) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        console.log('🔄 Obteniendo Stripe Public Key...');
        const response = await api.get('pagos/public-key/');
        console.log('📦 Respuesta del backend:', response.data);
        
        // El backend puede devolver publicKey o public_key, manejamos ambos casos
        const publicKey = response.data.publicKey || response.data.public_key;
        console.log('🔑 Public Key extraída:', publicKey);
        
        if (!publicKey) {
          throw new Error('El backend no devolvió una clave pública válida');
        }
        
        console.log('✅ Inicializando loadStripe()...');
        setStripePromise(loadStripe(publicKey));
        console.log('✅ Stripe inicializado correctamente');
        setLoading(false);
      } catch (err) {
        console.error('❌ Error completo al cargar Stripe:', err);
        setError('No se pudo inicializar el sistema de pagos. Verifica tu conexión.');
        setLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando sistema de pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Error de Inicialización</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return stripePromise ? (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  ) : null;
};
