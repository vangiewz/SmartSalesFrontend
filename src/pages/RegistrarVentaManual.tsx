// src/pages/RegistrarVentaManual.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, MapPin, CreditCard, Trash2, Plus, Minus, Receipt } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../hooks/useAuth'
import {
  buscarClientePorCorreo,
  buscarProductosVenta,
  agregarAlCarrito,
  obtenerCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
  registrarVentaDesdeCarrito,
  type ClienteInfo,
  type ProductoVenta,
  type Carrito
} from '../services/ventaManualApi'

export default function RegistrarVentaManual() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Verificar permisos
  const is_vendedor = user?.is_vendedor || false

  useEffect(() => {
    if (!is_vendedor) {
      toast.error('Solo los vendedores pueden registrar ventas manuales')
      navigate('/gestion-comercial')
    }
  }, [is_vendedor, navigate])

  // Estados
  const [cliente, setCliente] = useState<ClienteInfo | null>(null)
  const [productos, setProductos] = useState<ProductoVenta[]>([])
  const [carrito, setCarrito] = useState<Carrito | null>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [direccion, setDireccion] = useState('')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo')
  const [cargando, setCargando] = useState(false)

  // Cargar productos iniciales y carrito al montar
  useEffect(() => {
    cargarProductosIniciales()
    cargarCarrito()
  }, [])

  // Recargar productos cuando cambia la búsqueda (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busquedaProducto.trim().length >= 2) {
        buscarProductos(busquedaProducto)
      } else if (busquedaProducto.trim().length === 0) {
        cargarProductosIniciales()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [busquedaProducto])

  // Funciones de carga inicial
  const cargarProductosIniciales = async () => {
    try {
      const prods = await buscarProductosVenta('')
      setProductos(prods)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const cargarCarrito = async () => {
    try {
      const carritoActual = await obtenerCarrito()
      setCarrito(carritoActual)
    } catch (error) {
      console.error('Error al cargar carrito:', error)
    }
  }

  // Buscar cliente
  const handleBuscarCliente = async () => {
    if (!busquedaCliente.trim()) {
      toast.error('Ingrese un correo electrónico')
      return
    }

    setCargando(true)
    try {
      const clienteEncontrado = await buscarClientePorCorreo(busquedaCliente.trim())
      setCliente(clienteEncontrado)
      toast.success(`Cliente encontrado: ${clienteEncontrado.nombre}`)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Cliente no encontrado')
      setCliente(null)
    } finally {
      setCargando(false)
    }
  }

  // Buscar productos
  const buscarProductos = async (busqueda: string) => {
    try {
      const resultados = await buscarProductosVenta(busqueda)
      setProductos(resultados)
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } }
      if (err.response?.status === 404) {
        setProductos([])
        toast.error('No se encontraron productos')
      }
    }
  }

  // Agregar producto al carrito
  const handleAgregarProducto = async (producto: ProductoVenta) => {
    setCargando(true)
    try {
      const carritoActualizado = await agregarAlCarrito(producto.producto_id, 1)
      setCarrito(carritoActualizado)
      toast.success(`${producto.nombre} agregado al carrito`)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Error al agregar producto')
    } finally {
      setCargando(false)
    }
  }

  // Actualizar cantidad en carrito
  const handleActualizarCantidad = async (producto_id: number, cantidad: number) => {
    if (cantidad < 1) return
    
    try {
      const carritoActualizado = await actualizarCantidadCarrito(producto_id, cantidad)
      setCarrito(carritoActualizado)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Error al actualizar cantidad')
      await cargarCarrito()
    }
  }

  // Eliminar producto del carrito
  const handleEliminarProducto = async (producto_id: number) => {
    try {
      const carritoActualizado = await eliminarDelCarrito(producto_id)
      setCarrito(carritoActualizado)
      toast.success('Producto eliminado')
    } catch {
      toast.error('Error al eliminar producto')
    }
  }

  // Vaciar carrito
  const handleVaciarCarrito = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return
    
    try {
      const carritoVacio = await vaciarCarrito()
      setCarrito(carritoVacio)
      toast.success('Carrito vaciado')
    } catch {
      toast.error('Error al vaciar carrito')
    }
  }

  // Registrar venta
  const handleRegistrarVenta = async () => {
    if (!cliente) {
      toast.error('Debe seleccionar un cliente')
      return
    }
    if (!carrito || carrito.items.length === 0) {
      toast.error('El carrito está vacío')
      return
    }
    if (!direccion.trim()) {
      toast.error('Debe ingresar una dirección de entrega')
      return
    }

    setCargando(true)
    try {
      const venta = await registrarVentaDesdeCarrito(
        cliente.correo,
        direccion.trim(),
        metodoPago,
        carrito
      )

      toast.success(`¡Venta registrada exitosamente! ID: ${venta.venta_id}`)

      // Limpiar formulario
      setCliente(null)
      setBusquedaCliente('')
      setDireccion('')
      setMetodoPago('efectivo')
      await cargarCarrito()
      await cargarProductosIniciales()

    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      toast.error(err.response?.data?.detail || 'Error al registrar venta')
    } finally {
      setCargando(false)
    }
  }

  if (!is_vendedor) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-white p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-3 rounded-2xl shadow-lg">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  🏪 Venta Manual - Mostrador
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Registra ventas en mostrador de forma rápida y sencilla
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMNA IZQUIERDA: Cliente y Productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* SECCIÓN 1: BUSCAR CLIENTE */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-amber-600" />
                  Paso 1: Buscar Cliente
                </h2>
                
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarCliente()}
                    className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={cargando}
                  />
                  <button
                    onClick={handleBuscarCliente}
                    disabled={cargando}
                    className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>

                {cliente && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-green-900">{cliente.nombre}</p>
                        <p className="text-sm text-green-700">{cliente.correo}</p>
                        <p className="text-sm text-green-700">📱 {cliente.telefono}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: PRODUCTOS DISPONIBLES */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-200">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-amber-600" />
                  Paso 2: Seleccionar Productos
                </h2>

                <input
                  type="text"
                  placeholder="Buscar producto... (ej: refrigerador, licuadora)"
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {productos.length > 0 ? (
                    productos.map((producto) => (
                      <div
                        key={producto.producto_id}
                        className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-amber-300 transition-all"
                      >
                        <h3 className="font-bold text-lg mb-1 text-gray-900">{producto.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {producto.marca} - {producto.tipo}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-2xl font-bold text-green-600">
                            ${parseFloat(producto.precio).toFixed(2)}
                          </span>
                          <span className={`text-sm font-semibold ${producto.stock <= 7 ? 'text-red-500' : 'text-gray-500'}`}>
                            Stock: {producto.stock}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAgregarProducto(producto)}
                          disabled={cargando || producto.stock === 0}
                          className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:bg-gray-300 flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar al Carrito
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-center text-gray-500 py-8">
                      No hay productos disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Carrito y Resumen */}
            <div className="space-y-6">
              {/* CARRITO */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-amber-200 sticky top-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6 text-amber-600" />
                    Carrito
                  </h2>
                  {carrito && carrito.items.length > 0 && (
                    <button
                      onClick={handleVaciarCarrito}
                      className="text-sm text-red-500 hover:text-red-700 font-semibold"
                    >
                      Vaciar
                    </button>
                  )}
                </div>

                {carrito && carrito.items.length > 0 ? (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {carrito.items.map((item) => (
                        <div key={item.producto_id} className="border-b pb-3 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-gray-900">{item.nombre}</p>
                              <p className="text-xs text-gray-500">${Number(item.precio).toFixed(2)} c/u</p>
                            </div>
                            <button
                              onClick={() => handleEliminarProducto(item.producto_id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleActualizarCantidad(item.producto_id, item.cantidad - 1)}
                                disabled={item.cantidad <= 1}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-bold w-8 text-center">{item.cantidad}</span>
                              <button
                                onClick={() => handleActualizarCantidad(item.producto_id, item.cantidad + 1)}
                                disabled={item.cantidad >= item.stock_disponible}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-bold text-amber-600">${Number(item.subtotal).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                          ${Number(carrito.total).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 text-center">
                        {carrito.cantidad_items} producto(s)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-4xl mb-2">🛒</p>
                    <p className="text-gray-500">Carrito vacío</p>
                  </div>
                )}
              </div>

              {/* FORMULARIO DE VENTA */}
              {carrito && carrito.items.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-green-600" />
                    Finalizar Venta
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Dirección de Entrega
                      </label>
                      <textarea
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Calle, número, ciudad..."
                        className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <CreditCard className="h-4 w-4" />
                        Método de Pago
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'efectivo', label: 'Efectivo', icon: '💵' },
                          { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
                          { value: 'transferencia', label: 'Transfer', icon: '🏦' }
                        ].map((metodo) => (
                          <button
                            key={metodo.value}
                            onClick={() => setMetodoPago(metodo.value as typeof metodoPago)}
                            className={`p-3 rounded-xl font-semibold transition-all text-sm ${
                              metodoPago === metodo.value
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-xl block mb-1">{metodo.icon}</span>
                            <span className="text-xs">{metodo.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleRegistrarVenta}
                      disabled={cargando || !cliente}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl text-lg hover:shadow-2xl transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {cargando ? 'Procesando...' : '✅ REGISTRAR VENTA'}
                    </button>

                    {!cliente && (
                      <p className="text-sm text-red-500 text-center font-semibold">
                        ⚠️ Primero busca un cliente
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
