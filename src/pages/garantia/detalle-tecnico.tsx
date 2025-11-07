// src/pages/garantia/detalle.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/ProtectedLayout';
import { useAuth } from '../../hooks/useAuth';
import { getGarantiaDetalle, evaluateGarantia } from '../../services/garantiaApi';
import type { GarantiaDetalle } from '../../types/garantia';
import {
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Package,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DetalleTecnicoGarantiaPage() {
  const { venta_id, producto_id, garantia_id } = useParams<{
    venta_id: string;
    producto_id: string;
    garantia_id: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [garantia, setGarantia] = useState<GarantiaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detectar si es técnico o admin
  const isTecnico = user?.roles_ids?.includes(5) ?? false;
  const isAdmin = user?.roles_ids?.includes(2) ?? false;
  const canEvaluate = isTecnico || isAdmin;

  // Debug: mostrar roles del usuario
  useEffect(() => {
    console.log('� [TECNICO] Usuario:', user);
    console.log('� [TECNICO] Roles IDs:', user?.roles_ids);
    console.log('� [TECNICO] Es técnico?:', isTecnico);
    console.log('� [TECNICO] Es admin?:', isAdmin);
    console.log('🔧 [TECNICO] Puede evaluar?:', canEvaluate);
    
    if (!canEvaluate) {
      console.warn('⚠️ [TECNICO] Usuario no tiene permisos para evaluar garantías');
    }
  }, [user, isTecnico, isAdmin, canEvaluate]);

  useEffect(() => {
    const fetchGarantia = async () => {
      if (!venta_id || !producto_id || !garantia_id) {
        setError('Parámetros inválidos');
        setLoading(false);
        return;
      }

      console.log('🔍 Cargando detalle de garantía:', {
        venta_id,
        producto_id,
        garantia_id,
        url: `/garantia/detalle/${venta_id}/${producto_id}/${garantia_id}/`
      });

      try {
        setLoading(true);
        setError(null);

        // Obtener el detalle completo de la garantía
        const data = await getGarantiaDetalle(
          parseInt(venta_id),
          parseInt(producto_id),
          parseInt(garantia_id)
        );

        console.log('✅ Detalle cargado:', data);
        setGarantia(data);
      } catch (err) {
        console.error('❌ Error al cargar garantía:', err);
        console.error('❌ Error completo:', JSON.stringify(err, null, 2));
        const mensaje = (err as Error).message || 'Error al cargar la garantía';
        setError(mensaje);
        toast.error(mensaje, {
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            border: '2px solid #ef4444',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGarantia();
  }, [venta_id, producto_id, garantia_id]);

  const handleEvaluate = async (reemplazo: boolean | null) => {
    if (!garantia || !garantia_id) return;

    if (!canEvaluate) {
      toast.error('No tienes permisos para evaluar garantías', {
        icon: '🔒',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#374151',
          border: '2px solid #ef4444',
        },
      });
      return;
    }

    // Mapear reemplazo a evaluacion
    const evaluacion = reemplazo === false ? "Reparar" : reemplazo === true ? "Reemplazar" : "Rechazar";
    
    const accionTexto =
      reemplazo === true
        ? 'reemplazar el producto'
        : reemplazo === false
        ? 'reparar el producto'
        : 'rechazar el reclamo';

    console.log('🔧 [TECNICO] Iniciando evaluación:', {
      garantia_id,
      evaluacion,
      user_id: user?.id,
      roles: user?.roles_ids
    });

    // Confirmación con toast
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-bold text-gray-900 mb-1">¿Confirmar evaluación?</p>
            <p className="text-sm text-gray-600">
              Estás a punto de {accionTexto}. Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  setEvaluating(true);

                  const loadingToast = toast.loading('Procesando evaluación...', {
                    style: {
                      borderRadius: '12px',
                      background: '#fff',
                      color: '#374151',
                    },
                  });

                  console.log('📤 [TECNICO] Enviando evaluación:', {
                    garantia_id,
                    data: { evaluacion, comentario_tecnico: "Evaluación realizada por técnico" }
                  });

                  await evaluateGarantia(
                    parseInt(garantia_id),
                    { 
                      evaluacion,
                      comentario_tecnico: "Evaluación realizada por técnico"
                    }
                  );

                  console.log('✅ [TECNICO] Evaluación exitosa');

                  toast.dismiss(loadingToast);
                  toast.success('Evaluación registrada exitosamente', {
                    icon: '✅',
                    duration: 3000,
                    style: {
                      borderRadius: '12px',
                      background: '#fff',
                      color: '#374151',
                      border: '2px solid #10b981',
                    },
                  });

                  // Recargar el detalle
                  const updatedDetalle = await getGarantiaDetalle(
                    parseInt(venta_id!),
                    parseInt(producto_id!),
                    parseInt(garantia_id)
                  );
                  setGarantia(updatedDetalle);
                } catch (err) {
                  console.error('❌ [TECNICO] Error al evaluar:', err);
                  console.error('❌ [TECNICO] Error detallado:', JSON.stringify(err, null, 2));
                  
                  const errorMsg = (err as unknown as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.detail || 
                                   (err as unknown as { response?: { data?: { detail?: string; message?: string } } })?.response?.data?.message ||
                                   (err as Error).message || 
                                   'Error al evaluar la garantía';
                  
                  toast.error(`Error: ${errorMsg}`, {
                    duration: 5000,
                    style: {
                      borderRadius: '12px',
                      background: '#fff',
                      color: '#374151',
                      border: '2px solid #ef4444',
                    },
                  });
                } finally {
                  setEvaluating(false);
                }
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
            >
              Confirmar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '400px',
          background: '#fff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 2px #e9d5ff',
          border: '2px solid #e9d5ff',
        },
      }
    );
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      Pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Completado: 'bg-green-100 text-green-800 border-green-300',
      Rechazado: 'bg-red-100 text-red-800 border-red-300',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'N/A';
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fecha));
  };

  const isGarantiaVigente = (limiteStr: string) => {
    return new Date(limiteStr) > new Date();
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando detalle de garantía...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error || !garantia) {
    return (
      <ProtectedLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-red-900 font-bold text-lg mb-2">Error</p>
              <p className="text-red-800 mb-4">{error || 'Garantía no encontrada'}</p>
              <button
                onClick={() => navigate('/garantia')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botón de volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
          {/* Header del card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Gestión Técnica - Garantía
                </h1>
                <p className="text-purple-100">
                  Garantía #{garantia.garantia_id} - Venta #{garantia.venta_id}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 sm:p-8">
            {/* Estado */}
            <div className="mb-6">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 ${getEstadoBadge(
                  garantia.estado
                )}`}
              >
                {garantia.estado}
              </span>
            </div>

            {/* Información del producto */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                {garantia.producto_imagen_url ? (
                  <img
                    src={garantia.producto_imagen_url}
                    alt={garantia.producto_nombre}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {garantia.producto_nombre}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold">Producto ID:</span> #{garantia.producto_id}
                    </p>
                    <p>
                      <span className="font-semibold">Cantidad reclamada:</span> {garantia.cantidad}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-600">Fecha del reclamo</p>
                </div>
                <p className="text-gray-900 font-semibold">{formatFecha(garantia.fecha_solicitud)}</p>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-semibold text-gray-600">Límite de garantía</p>
                </div>
                <p className="text-gray-900 font-semibold">{formatFecha(garantia.limite_garantia)}</p>
                {isGarantiaVigente(garantia.limite_garantia) ? (
                  <span className="text-xs text-green-600 font-semibold">✓ Vigente</span>
                ) : (
                  <span className="text-xs text-red-600 font-semibold">✗ Vencida</span>
                )}
              </div>
            </div>

            {/* Motivo del reclamo */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                Motivo del reclamo
              </h3>
              <p className="text-gray-800 leading-relaxed">{garantia.motivo}</p>
            </div>

            {/* Resultado de evaluación (si está completado o rechazado) */}
            {(garantia.estado === 'Completado' || garantia.estado === 'Rechazado') && (
              <div
                className={`border-2 rounded-xl p-6 mb-6 ${
                  garantia.estado === 'Completado'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  {garantia.estado === 'Completado' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Resultado de la evaluación
                </h3>
                {garantia.estado === 'Completado' && (
                  <div className="flex items-center gap-2">
                    {garantia.es_reemplazo === true ? (
                      <>
                        <RefreshCw className="h-5 w-5 text-green-600" />
                        <p className="text-green-800 font-semibold">✅ Producto reemplazado</p>
                      </>
                    ) : (
                      <>
                        <Wrench className="h-5 w-5 text-blue-600" />
                        <p className="text-blue-800 font-semibold">🔧 Producto reparado</p>
                      </>
                    )}
                  </div>
                )}
                {garantia.estado === 'Rechazado' && (
                  <p className="text-red-800 font-semibold">❌ Reclamo rechazado</p>
                )}
              </div>
            )}

            {/* Botones de evaluación (solo para técnicos/admins y si está pendiente) */}
            {canEvaluate && garantia.estado === 'Pendiente' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Evaluar reclamo</h3>
                <p className="text-gray-700 mb-6 text-sm">
                  Selecciona la acción que deseas realizar sobre este reclamo:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleEvaluate(false)}
                    disabled={evaluating}
                    className="flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wrench className="h-8 w-8" />
                    <span>Reparar</span>
                  </button>

                  <button
                    onClick={() => handleEvaluate(true)}
                    disabled={evaluating}
                    className="flex flex-col items-center gap-3 bg-gradient-to-br from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white p-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="h-8 w-8" />
                    <span>Reemplazar</span>
                  </button>

                  <button
                    onClick={() => handleEvaluate(null)}
                    disabled={evaluating}
                    className="flex flex-col items-center gap-3 bg-gradient-to-br from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-6 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="h-8 w-8" />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mensaje si no puede evaluar */}
            {!canEvaluate && garantia.estado === 'Pendiente' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-red-900 font-semibold mb-1">Sin permisos</p>
                    <p className="text-red-800 text-sm">
                      No tienes los permisos necesarios para evaluar garantías. Se requiere rol de Técnico o Administrador.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje para no técnicos */}
            {!canEvaluate && !isTecnico && !isAdmin && garantia.estado === 'Pendiente' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-blue-900 font-semibold mb-1">Reclamo en revisión</p>
                    <p className="text-blue-800 text-sm">
                      Tu reclamo está siendo evaluado por el equipo técnico. Te notificaremos cuando haya una resolución.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
