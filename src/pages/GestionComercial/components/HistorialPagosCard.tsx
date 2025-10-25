// src/pages/GestionComercial/components/HistorialPagosCard.tsx

import { useState } from 'react';
import { Receipt, Calendar, Package, ExternalLink, X, Loader } from 'lucide-react';
import { getHistorialPagos } from '../../../services/historialPagosApi';
import type { HistorialPago } from '../../../types/historialPagos';
import toast from 'react-hot-toast';

export default function HistorialPagosCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [pagos, setPagos] = useState<HistorialPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenModal = async () => {
    setModalOpen(true);
    setLoading(true);
    setError(null);

    try {
      const data = await getHistorialPagos();
      setPagos(data);
    } catch (err) {
      console.error('Error al cargar historial de pagos:', err);
      const errorMessage = 'Error al cargar el historial de pagos';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fechaStr));
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  return (
    <>
      {/* Card Principal */}
      <div
        onClick={handleOpenModal}
        className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
            <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
            Mis Pagos
          </h2>
        </div>
        <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
          Consulta tu historial de compras y comprobantes de pago.
        </p>
        <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
          <span>Ver Historial</span>
          <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Historial de Pagos</h2>
                  <p className="text-purple-100 text-xs sm:text-sm">Tus compras realizadas</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-600">Cargando historial...</p>
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-600 font-semibold">{error}</p>
                </div>
              )}

              {!loading && !error && pagos.length === 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center">
                  <Receipt className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No hay pagos registrados
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tus compras aparecerán aquí una vez que realices tu primer pago.
                  </p>
                </div>
              )}

              {!loading && !error && pagos.length > 0 && (
                <div className="space-y-4">
                  {pagos.map((pago) => (
                    <div
                      key={pago.pago_id}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all"
                    >
                      {/* Header del Pago */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b-2 border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                            <Receipt className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Venta #{pago.venta_id}</p>
                            <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {formatearPrecio(pago.total)}
                            </p>
                          </div>
                        </div>

                        {pago.receipt_url && (
                          <a
                            href={pago.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver Comprobante
                          </a>
                        )}
                      </div>

                      {/* Información del Pago */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Fecha de Pago</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatearFecha(pago.fecha_pago)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Dirección de Envío</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {pago.direccion_envio}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-600" />
                          Productos ({pago.productos.length})
                        </h4>
                        <div className="space-y-2">
                          {pago.productos.map((producto) => (
                            <div
                              key={producto.producto_id}
                              className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {producto.producto_nombre}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatearPrecio(producto.precio_unitario)} × {producto.cantidad}
                                </p>
                              </div>
                              <p className="font-bold text-purple-600 ml-4">
                                {formatearPrecio(producto.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-200">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
