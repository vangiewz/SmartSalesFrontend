// src/pages/Checkout/index.tsx

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import ProtectedLayout from '../../components/ProtectedLayout';
import { CreditCard, MapPin, ShoppingBag, Loader, AlertCircle, Lock } from 'lucide-react';
import { getDirecciones, type Direccion } from '../../services/direccionesApi';
import { iniciarCheckout, confirmarPago, type ConfirmarPagoRequest } from '../../services/pagosApi';
import { getCarrito, carritoToCheckoutItems, limpiarCarrito } from '../../utils/carrito';
import { api } from '../../lib/client';
import toast from 'react-hot-toast';
import type { ProductoCatalogo } from '../../types/catalogo';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const stripe = useStripe();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [carrito, setCarrito] = useState<Record<number, number>>({});

  const [direccionSeleccionada, setDireccionSeleccionada] = useState<number | null>(null);
  const [usarDireccionManual, setUsarDireccionManual] = useState(false);
  const [direccionManual, setDireccionManual] = useState('');

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const carritoLocal = getCarrito();

    if (Object.keys(carritoLocal).length === 0) {
      toast.error('Tu carrito está vacío');
      navigate('/carrito');
      return;
    }

    setCarrito(carritoLocal);
    fetchData(Object.keys(carritoLocal).map(Number));
  }, [navigate]);

  const fetchData = async (productIds: number[]) => {
    try {
      setLoading(true);

      // Fetch direcciones
      const dirs = await getDirecciones();
      setDirecciones(dirs);

      // Si hay direcciones guardadas, seleccionar la primera por defecto
      if (dirs.length > 0 && !usarDireccionManual) {
        setDireccionSeleccionada(dirs[0].id!);
        console.log('✅ Dirección pre-seleccionada:', dirs[0].id);
      }

      // Fetch productos
      const response = await api.get('listadoproductos/', {
        params: {
          page_size: 100,
        },
      });

      const allProducts = response.data.results || [];
      const cartProducts = allProducts.filter((p: ProductoCatalogo) =>
        productIds.includes(p.id)
      );
      setProductos(cartProducts);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar información del checkout');
      toast.error('Error al cargar datos del checkout');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return productos.reduce((total, prod) => {
      return total + prod.precio * (carrito[prod.id] || 0);
    }, 0);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(precio);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe) {
      setError('Stripe no está listo. Por favor recarga la página.');
      return;
    }

    // Validar dirección
    if (!usarDireccionManual && !direccionSeleccionada) {
      setError('⚠️ Por favor selecciona una dirección de envío');
      return;
    }

    if (usarDireccionManual) {
      if (direccionManual.trim().length < 5) {
        setError('⚠️ Por favor ingresa una dirección válida (mínimo 5 caracteres)');
        return;
      }
      if (direccionManual.length > 500) {
        setError('⚠️ La dirección es demasiado larga (máximo 500 caracteres)');
        return;
      }
    }

    setProcesando(true);
    setError('');

    try {
      // 1. Crear Payment Intent y validar stock
      const items = carritoToCheckoutItems(carrito);
      
      // Construir payload correctamente - no enviar campos null o undefined
      const checkoutRequest: any = { items };

      if (usarDireccionManual) {
        const direccionTexto = direccionManual.trim();
        if (direccionTexto) {
          checkoutRequest.direccion_manual = direccionTexto;
        }
      } else if (direccionSeleccionada) {
        checkoutRequest.id_direccion = direccionSeleccionada; // ✅ Nombre correcto
      }

      console.log('📤 Enviando al backend:', checkoutRequest);

      // Llamar al servicio de checkout
      const checkoutResponse = await iniciarCheckout(checkoutRequest);

      // DEBUG: Ver respuesta completa
      console.log('📦 Respuesta del backend:', checkoutResponse);
      console.log('📦 Tipo de respuesta:', typeof checkoutResponse);
      console.log('📦 Keys de respuesta:', Object.keys(checkoutResponse));

      // Validar que tenemos los datos necesarios (✅ camelCase)
      if (!checkoutResponse || !checkoutResponse.clientSecret) {
        console.error('❌ Respuesta del backend incompleta:', checkoutResponse);
        setError('Error: el servidor no retornó el clientSecret necesario');
        setProcesando(false);
        return;
      }

      const { clientSecret, paymentIntentId } = checkoutResponse;

      // Validar formato del clientSecret
      if (!clientSecret || typeof clientSecret !== 'string' || !clientSecret.includes('_secret_')) {
        console.error('❌ Client Secret inválido:', clientSecret);
        setError('Error: el servidor retornó un client secret inválido');
        setProcesando(false);
        return;
      }

      console.log('✅ Payment Intent creado');
      console.log('✅ Client Secret recibido:', clientSecret.substring(0, 20) + '...');
      console.log('✅ Payment Intent ID:', paymentIntentId);
      console.log('✅ Client Secret válido:', clientSecret.startsWith('pi_'));

      // 2. Crear Payment Method con tarjeta de prueba
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          token: 'tok_visa', // Token de prueba oficial de Stripe
        },
      });

      if (pmError || !paymentMethod) {
        console.error('❌ Error creando Payment Method:', pmError);
        setError(pmError?.message || 'Error al procesar el pago');
        setProcesando(false);
        return;
      }

      console.log('✅ Payment Method creado:', paymentMethod.id);

      // 3. Confirmar pago con el Payment Method creado
      console.log('🔄 Confirmando pago con Stripe...');
      console.log('🔑 Client Secret a usar:', clientSecret.substring(0, 20) + '...');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (stripeError) {
        console.error('❌ Error confirmando pago:', stripeError);
        setError(stripeError.message || 'Error al procesar el pago');
        setProcesando(false);
        return;
      }

      if (paymentIntent?.status !== 'succeeded') {
        console.error('❌ Pago no completado. Status:', paymentIntent?.status);
        setError('El pago no se completó correctamente');
        setProcesando(false);
        return;
      }

      console.log('✅ Pago confirmado en Stripe:', paymentIntent.id);

      // 4. Confirmar pago en el backend para obtener venta_id y receipt_url
      console.log('🔄 Confirmando pago en el backend...');
      
      const confirmRequest: ConfirmarPagoRequest = {
        paymentIntentId: paymentIntent.id,
      };

      const confirmData = await confirmarPago(confirmRequest);
      
      console.log('✅ Pago confirmado en backend:', confirmData);
      console.log('📄 Receipt URL:', confirmData.receipt_url || 'No disponible');

      // 5. Limpiar carrito y redirigir
      limpiarCarrito();
      toast.success('¡Compra realizada con éxito!');
      navigate('/compra-exitosa', {
        state: {
          venta_id: confirmData.venta_id,
          receipt_url: confirmData.receipt_url,
          message: confirmData.message,
          status: confirmData.status,
          total: calcularTotal(),
        },
      });
    } catch (err) {
      console.error('❌ Error en checkout:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error keys:', err ? Object.keys(err) : 'null');
      
      // Si el error es de Axios, mostrar detalles
      if ((err as any)?.response) {
        console.error('❌ Response status:', (err as any).response.status);
        console.error('❌ Response data:', (err as any).response.data);
      }
      
      const errorMessage = (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail || 
                          (err as { message?: string })?.message || 
                          'Error al procesar la compra';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando checkout...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
          Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dirección de Envío */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Dirección de Envío</h2>
                </div>

                {/* Direcciones guardadas */}
                {direcciones.length > 0 && !usarDireccionManual && (
                  <div className="space-y-3 mb-4">
                    {direcciones.map((dir) => (
                      <label
                        key={dir.id}
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          direccionSeleccionada === dir.id
                            ? 'border-purple-600 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="direccion"
                          value={dir.id}
                          checked={direccionSeleccionada === dir.id}
                          onChange={() => setDireccionSeleccionada(dir.id!)}
                          className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <p className="text-gray-700 leading-relaxed">
                            {dir.direccion}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Mensaje si no hay direcciones guardadas */}
                {direcciones.length === 0 && !usarDireccionManual && (
                  <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-yellow-900 mb-1">No tienes direcciones guardadas</p>
                      <p className="text-sm text-yellow-700">
                        Marca la casilla de abajo para ingresar una dirección de envío.
                      </p>
                    </div>
                  </div>
                )}

                {/* Toggle dirección manual */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="direccion-manual"
                    checked={usarDireccionManual}
                    onChange={(e) => {
                      setUsarDireccionManual(e.target.checked);
                      if (e.target.checked) {
                        setDireccionSeleccionada(null);
                      } else {
                        setDireccionManual('');
                        // Re-seleccionar primera dirección si existe
                        if (direcciones.length > 0) {
                          setDireccionSeleccionada(direcciones[0].id!);
                        }
                      }
                    }}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <label htmlFor="direccion-manual" className="text-gray-700 font-medium cursor-pointer">
                    Usar una dirección diferente
                  </label>
                </div>

                {/* Formulario dirección manual */}
                {usarDireccionManual && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección Completa <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={direccionManual}
                      onChange={(e) => setDireccionManual(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Ej: Av. Siempre Viva 742, Springfield, Estado, CP 12345"
                      required={usarDireccionManual}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {direccionManual.length}/500 caracteres • Incluye calle, número, colonia, ciudad, estado y código postal
                    </p>
                  </div>
                )}
              </div>

              {/* Información de Pago - SIMULADO */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Información de Pago</h2>
                </div>

                {/* Formulario Visual SIMULADO (no funcional, solo estético) */}
                <div className="space-y-4">
                  {/* Número de Tarjeta */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de tarjeta
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="4242 4242 4242 4242"
                        disabled
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono cursor-not-allowed"
                      />
                      <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Fecha y CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        value="12/28"
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value="123"
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Código Postal */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value="12345"
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Mensaje informativo */}
                <div className="mt-6 flex items-start gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-bold text-purple-900 mb-1">🎓 Tarjeta de Prueba Pre-Configurada</p>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      Esta es una tarjeta de prueba Stripe lista para usar. Simplemente selecciona tu
                      dirección de envío y haz clic en "Procesar Pago". No se realizará ningún cargo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-lg border-2 border-purple-200 sticky top-4">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">Resumen</h2>
                </div>

                {/* Productos */}
                <div className="space-y-3 mb-6 pb-6 border-b-2 border-purple-200 max-h-64 overflow-y-auto">
                  {productos.map((prod) => (
                    <div key={prod.id} className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{prod.nombre}</p>
                        <p className="text-xs text-gray-600">Cantidad: {carrito[prod.id]}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {formatearPrecio(prod.precio * carrito[prod.id])}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">{formatearPrecio(calcularTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Envío:</span>
                    <span className="text-green-600 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t-2 border-purple-300">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatearPrecio(calcularTotal())}
                    </span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Botón */}
                <button
                  type="submit"
                  disabled={!stripe || procesando}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {procesando ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Procesando pago...
                    </>
                  ) : (
                    `Pagar ${formatearPrecio(calcularTotal())}`
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  Al completar la compra, aceptas nuestros términos y condiciones
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
