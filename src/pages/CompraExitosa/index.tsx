// src/pages/CompraExitosa/index.tsx

import { useLocation, useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/ProtectedLayout';
import { CheckCircle, Home, Package, Sparkles, FileText, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

interface LocationState {
  venta_id: number;
  receipt_url?: string;
  message?: string;
  status?: string;
  total?: number;
}

export default function CompraExitosaPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const { venta_id, receipt_url, message, total } = state || {};

  // Si no hay datos, redirigir al inicio
  useEffect(() => {
    if (!venta_id) {
      navigate('/inicio', { replace: true });
    }
  }, [venta_id, navigate]);

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8" />
              ¡Compra Exitosa!
              <Sparkles className="w-8 h-8" />
            </h1>
            <p className="text-lg md:text-xl text-purple-100">
              Tu pedido ha sido procesado correctamente
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6 md:p-12">
            {/* Detalles de la transacción */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 sm:p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Número de Venta */}
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Número de Venta</p>
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    #{venta_id}
                  </p>
                </div>
                
                {/* Total Pagado */}
                {total && (
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-600 mb-2 font-medium">Total Pagado</p>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatearPrecio(total)}
                    </p>
                  </div>
                )}
              </div>

              {/* Comprobante de Stripe integrado */}
              {receipt_url && (
                <div className="mt-6 pt-6 border-t-2 border-purple-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-white p-2.5 rounded-lg shadow-sm border border-purple-200">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Comprobante de Pago</p>
                        <p className="text-xs text-gray-600">Descarga tu recibo oficial</p>
                      </div>
                    </div>
                    <a
                      href={receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-300 hover:border-purple-400 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Ver Comprobante</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Información de procesamiento */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 mb-8 border-2 border-purple-100">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl flex-shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">¿Qué sigue?</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Tu venta ha sido registrada exitosamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Recibirás un correo de confirmación en unos momentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Tu pedido será preparado y enviado pronto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <span>Puedes consultar el estado de tu pedido en tu historial</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mensaje personalizado */}
            {message && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-blue-800 font-medium">{message}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col gap-4 mb-6">
              <button
                onClick={() => navigate('/inicio')}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Package className="w-5 h-5" />
                Explorar Más Productos
              </button>
            </div>

            <button
              onClick={() => navigate('/inicio')}
              className="w-full inline-flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors py-3"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </button>

            {/* Nota de agradecimiento */}
            <div className="mt-8 text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <p className="text-gray-700 font-medium">
                ¡Gracias por tu compra! 💜
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Tu confianza en SmartSales es muy importante para nosotros
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
