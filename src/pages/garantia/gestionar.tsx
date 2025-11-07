// src/pages/garantia/gestionar.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/ProtectedLayout';
import { getGarantiasGestionar } from '../../services/garantiaApi';
import type { GarantiaClaim, EstadoGarantia } from '../../types/garantia';
import { Settings, Search, Calendar, Loader, AlertCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GestionarGarantiasPage() {
  const navigate = useNavigate();
  const [garantias, setGarantias] = useState<GarantiaClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoGarantia | ''>('');
  const [ventaId, setVentaId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Paginación (opcional)
  const [page] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const fetchGarantias = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: Record<string, string | number> = { page, page_size: pageSize };
        if (estadoFiltro) filters.estado = estadoFiltro;
        if (ventaId.trim()) filters.venta_id = parseInt(ventaId);
        if (productoId.trim()) filters.producto_id = parseInt(productoId);
        if (busqueda.trim()) filters.q = busqueda.trim();
        if (clienteEmail.trim()) filters.cliente = clienteEmail.trim();
        if (desde) filters.desde = new Date(desde).toISOString();
        if (hasta) filters.hasta = new Date(hasta).toISOString();

        console.log('🔧 [GESTIONAR] Filtros aplicados:', filters);
        
        const response = await getGarantiasGestionar(filters);
        
        console.log('✅ [GESTIONAR] Garantías cargadas (raw):', response);
        console.log('📊 [GESTIONAR] ¿Es array?:', Array.isArray(response));
        console.log('📊 [GESTIONAR] Tipo:', typeof response);
        console.log('📊 [GESTIONAR] Keys:', response ? Object.keys(response) : 'null');
        console.log('📊 [GESTIONAR] Length:', Array.isArray(response) ? response.length : 'N/A');
        
        // Manejar tanto arrays directos como objetos paginados
        const garantiasArray = Array.isArray(response) 
          ? response 
          : ((response as unknown as { results?: GarantiaClaim[] })?.results || []);
        
        console.log('📊 [GESTIONAR] Array final:', garantiasArray);
        console.log('📊 [GESTIONAR] Total de garantías:', garantiasArray.length);
        
        setGarantias(garantiasArray);
      } catch (err) {
        console.error('❌ [GESTIONAR] Error al cargar garantías:', err);
        const mensaje = (err as Error).message || 'Error al cargar las garantías';
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

    fetchGarantias();
  }, [page, estadoFiltro, ventaId, productoId, busqueda, clienteEmail, desde, hasta]);

  const getEstadoBadge = (estado: EstadoGarantia) => {
    const badges = {
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
      month: 'short',
      year: 'numeric',
    }).format(new Date(fecha));
  };

  const handleVerDetalle = (g: GarantiaClaim) => {
    // Siempre usa detalle-tecnico para "Gestionar" (vista de técnico con botones)
    navigate(`/garantia/detalle-tecnico/${g.venta_id}/${g.producto_id}/${g.garantia_id}`);
  };

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-2xl shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Gestión técnica
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Evalúa y resuelve todos los reclamos de garantía
          </p>
        </div>

        {/* Filtros avanzados */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select
                value={estadoFiltro}
                onChange={(e) => {
                  setEstadoFiltro(e.target.value as EstadoGarantia | '');

                }}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* ID de Venta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID de Venta</label>
              <input
                type="number"
                value={ventaId}
                onChange={(e) => {
                  setVentaId(e.target.value);

                }}
                placeholder="Ej: 123"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* ID de Producto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">ID de Producto</label>
              <input
                type="number"
                value={productoId}
                onChange={(e) => {
                  setProductoId(e.target.value);

                }}
                placeholder="Ej: 456"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Búsqueda por nombre de producto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);

                  }}
                  placeholder="Nombre del producto..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Email del cliente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email del cliente</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => {
                    setClienteEmail(e.target.value);

                  }}
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => {
                    setDesde(e.target.value);

                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => {
                    setHasta(e.target.value);

                  }}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-12 w-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando garantías...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-red-900 font-semibold mb-1">Error al cargar</p>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {!loading && !error && garantias.length === 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-12 text-center">
            <Settings className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay reclamos de garantía</h3>
            <p className="text-gray-600">
              No se encontraron reclamos que coincidan con los filtros aplicados
            </p>
          </div>
        )}

        {/* Lista de garantías */}
        {!loading && !error && garantias.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {garantias.map((g) => (
                <div
                  key={`${g.venta_id}-${g.producto_id}-${g.garantia_id}`}
                  onClick={() => handleVerDetalle(g)}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Header con imagen y estado */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Imagen del producto */}
                    {g.producto_imagen_url ? (
                      <img
                        src={g.producto_imagen_url}
                        alt={g.producto_nombre}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Settings className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-2 truncate">{g.producto_nombre}</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border-2 ${getEstadoBadge(
                          g.estado
                        )}`}
                      >
                        {g.estado}
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venta ID:</span>
                      <span className="font-semibold text-gray-900">#{g.venta_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Producto ID:</span>
                      <span className="font-semibold text-gray-900">#{g.producto_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-semibold text-gray-900">{g.cantidad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha reclamo:</span>
                      <span className="font-semibold text-gray-900">{formatFecha(g.fecha_solicitud || g.hora)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Límite garantía:</span>
                      <span className="font-semibold text-gray-900">{formatFecha(g.limite_garantia || g.limitegarantia)}</span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Motivo:</p>
                    <p className="text-sm text-gray-800 line-clamp-2">{g.motivo}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Info total de resultados */}
            <div className="text-center text-gray-600 font-medium mt-6">
              Mostrando {garantias.length} garantía{garantias.length !== 1 && 's'}
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}
