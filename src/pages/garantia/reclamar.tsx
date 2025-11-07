// src/pages/garantia/reclamar.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/ProtectedLayout';
import { createGarantia, getVentasElegibles } from '../../services/garantiaApi';
import type { VentaElegible, ProductoElegible } from '../../types/garantia';
import { ShieldCheck, AlertCircle, CheckCircle, Loader, Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReclamarGarantiaPage() {
  const navigate = useNavigate();
  
  // Estados del formulario
  const [ventaId, setVentaId] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  
  // Estados de datos
  const [ventas, setVentas] = useState<VentaElegible[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoElegible[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoElegible | null>(null);
  
  // Estados de UI
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar ventas elegibles al montar
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        setLoadingVentas(true);
        const data = await getVentasElegibles();
        setVentas(data);
      } catch (err) {
        console.error('Error al cargar ventas:', err);
        const mensaje = (err as Error).message || 'Error al cargar tus compras';
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
        setLoadingVentas(false);
      }
    };

    fetchVentas();
  }, []);

  // Actualizar productos disponibles cuando cambia la venta
  useEffect(() => {
    if (!ventaId) {
      setProductosDisponibles([]);
      setProductoId('');
      setProductoSeleccionado(null);
      return;
    }

    const venta = ventas.find((v) => v.venta_id === parseInt(ventaId));
    if (venta) {
      setProductosDisponibles(venta.productos);
      setProductoId('');
      setProductoSeleccionado(null);
    }
  }, [ventaId, ventas]);

  // Actualizar producto seleccionado cuando cambia el producto
  useEffect(() => {
    if (!productoId) {
      setProductoSeleccionado(null);
      return;
    }

    const producto = productosDisponibles.find((p) => p.producto_id === parseInt(productoId));
    if (producto) {
      setProductoSeleccionado(producto);
      setCantidad('1'); // Resetear a 1 por defecto
    }
  }, [productoId, productosDisponibles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!ventaId || !productoId || !cantidad || !motivo.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    const cantidadNum = parseInt(cantidad);
    if (cantidadNum < 1) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (productoSeleccionado && cantidadNum > productoSeleccionado.cantidad_comprada) {
      setError(`La cantidad no puede superar la cantidad comprada (${productoSeleccionado.cantidad_comprada})`);
      return;
    }

    if (motivo.length > 200) {
      setError('El motivo no puede superar los 200 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        venta_id: parseInt(ventaId),
        producto_id: parseInt(productoId),
        cantidad: cantidadNum,
        motivo: motivo.trim(),
      };

      const result = await createGarantia(payload);

      console.log('✅ Garantía creada:', result);
      console.log('🔗 Navegando a:', `/garantia/detalle/${result.venta_id}/${result.producto_id}/${result.garantia_id}`);

      setSuccess(true);
      toast.success('Reclamo creado exitosamente', {
        icon: '✅',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#374151',
          border: '2px solid #10b981',
        },
      });

      // Redirigir al detalle después de 2 segundos
      setTimeout(() => {
        // Navegar a detalle-cliente (solo lectura) después de crear
        navigate(`/garantia/detalle-cliente/${result.venta_id}/${result.producto_id}/${result.garantia_id}`);
      }, 2000);
    } catch (err) {
      console.error('Error al crear reclamo:', err);
      const mensaje = (err as Error).message || 'Error al crear el reclamo de garantía';
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
      setSubmitting(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fecha));
  };

  if (success) {
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center border-2 border-green-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Reclamo creado exitosamente!</h2>
            <p className="text-gray-600 mb-8">
              Tu reclamo de garantía ha sido registrado. Redirigiendo al detalle...
            </p>
            <Loader className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Reclamar garantía
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Selecciona una compra y el producto que deseas reclamar
          </p>
        </div>

        {/* Loading ventas */}
        {loadingVentas && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando tus compras...</p>
          </div>
        )}

        {/* Sin ventas elegibles */}
        {!loadingVentas && ventas.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes compras elegibles</h3>
            <p className="text-gray-700 mb-6">
              No encontramos productos con garantía vigente en tus compras. Recuerda que solo puedes reclamar productos cuya garantía aún no haya vencido.
            </p>
            <button
              onClick={() => navigate('/garantia')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Volver
            </button>
          </div>
        )}

        {/* Formulario */}
        {!loadingVentas && ventas.length > 0 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-purple-100">
            {/* Error global */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-900 font-semibold mb-1">Error</p>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Seleccionar Venta */}
              <div>
                <label htmlFor="venta_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecciona tu compra <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <select
                    id="venta_id"
                    value={ventaId}
                    onChange={(e) => setVentaId(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Selecciona una compra --</option>
                    {ventas.map((venta) => (
                      <option key={venta.venta_id} value={venta.venta_id}>
                        Venta #{venta.venta_id} - {formatFecha(venta.fecha_venta)} ({venta.productos.length} producto
                        {venta.productos.length !== 1 && 's'})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Solo se muestran compras con productos que tienen garantía vigente
                </p>
              </div>

              {/* Seleccionar Producto */}
              {ventaId && productosDisponibles.length > 0 && (
                <div>
                  <label htmlFor="producto_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecciona el producto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <select
                      id="producto_id"
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 bg-white appearance-none cursor-pointer"
                    >
                      <option value="">-- Selecciona un producto --</option>
                      {productosDisponibles.map((producto) => (
                        <option key={producto.producto_id} value={producto.producto_id}>
                          {producto.producto_nombre} (Cant: {producto.cantidad_comprada}) - Garantía hasta{' '}
                          {formatFecha(producto.limitegarantia)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Vista previa del producto seleccionado */}
              {productoSeleccionado && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-purple-700 mb-3">PRODUCTO SELECCIONADO</p>
                  <div className="flex items-start gap-4">
                    {productoSeleccionado.producto_imagen_url ? (
                      <img
                        src={productoSeleccionado.producto_imagen_url}
                        alt={productoSeleccionado.producto_nombre}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{productoSeleccionado.producto_nombre}</h3>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Cantidad comprada:</span> {productoSeleccionado.cantidad_comprada}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Garantía hasta:</span> {formatFecha(productoSeleccionado.limitegarantia)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cantidad */}
              {productoSeleccionado && (
                <div>
                  <label htmlFor="cantidad" className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad a reclamar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    min="1"
                    max={productoSeleccionado.cantidad_comprada}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900"
                    placeholder="Ej: 1"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Máximo: {productoSeleccionado.cantidad_comprada} (cantidad comprada)
                  </p>
                </div>
              )}

              {/* Motivo */}
              {productoSeleccionado && (
                <div>
                  <label htmlFor="motivo" className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivo del reclamo <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    maxLength={200}
                    rows={4}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-gray-900 resize-none"
                    placeholder="Describe el problema con el producto..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-600">Máximo 200 caracteres</p>
                    <p className={`text-xs font-semibold ${motivo.length > 200 ? 'text-red-600' : 'text-gray-600'}`}>
                      {motivo.length}/200
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            {productoSeleccionado && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Enviar reclamo
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/garantia')}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            )}
          </form>
        )}

        {/* Información adicional */}
        {!loadingVentas && ventas.length > 0 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Información importante
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Solo se muestran productos con garantía vigente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>La cantidad no puede superar la cantidad comprada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>El motivo debe ser claro y descriptivo (máx. 200 caracteres)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Un técnico evaluará tu reclamo en las próximas 48 horas</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
