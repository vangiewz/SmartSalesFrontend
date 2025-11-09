// src/pages/InicioPage.tsx (o src/pages/Inicio/index.tsx)

import ProtectedLayout from '../components/ProtectedLayout'
import { Search, Filter, Sparkles, Package, Mic, MicOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { useCatalogFilters } from '../hooks/useCatalogFilters'
import { ProductCard } from '../components/inicio/ProductCard'
import { api } from '../lib/client'
import { getCarrito, actualizarCantidad } from '../utils/carrito'

// ==== Tipos de la respuesta del backend de carrito por voz/texto ====
type CarritoVozProductoOpcion = {
  producto_id: number
  nombre: string
  precio_unitario: string
}

type CarritoVozItem = {
  producto_id: number
  nombre: string
  cantidad: number
  precio_unitario: string
  subtotal: string
  fragmento_voz: string
  opciones?: CarritoVozProductoOpcion[]
}

type CarritoVozResponse = {
  usuario_id: string
  texto: string
  total_estimado: string
  items: CarritoVozItem[]
  fragmentos_sin_match?: string[]
  mensaje?: string
}

export default function InicioPage() {
  const [searchInput, setSearchInput] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')

  // 👉 estado para armar carrito por texto/voz
  const [textoCarrito, setTextoCarrito] = useState('')
  const [escuchando, setEscuchando] = useState(false)
  const [vozDisponible, setVozDisponible] = useState(false)

  const {
    productos,
    loading,
    error,
    updateFilters
  } = useCatalogProducts()

  const {
    filtros,
    loading: loadingFilters
  } = useCatalogFilters()

  // Detectar si el navegador soporta reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      setVozDisponible(!!SpeechRecognition)
    }
  }, [])

  // ================= FUNCIONES EXISTENTES =================

  // Función para buscar al hacer click
  const handleSearch = () => {
    updateFilters({ q: searchInput })
  }

  const handleMarcaChange = (value: string) => {
    setSelectedMarca(value)
    updateFilters({ marca_id: value ? Number(value) : undefined })
  }

  const handleTipoChange = (value: string) => {
    setSelectedTipo(value)
    updateFilters({ tipoproducto_id: value ? Number(value) : undefined })
  }

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} agregado al carrito`, {
      icon: '🛒',
      style: {
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
        color: '#fff',
        fontWeight: 'bold',
      },
    })
  }

  // ================= NUEVO: ARMAR CARRITO POR TEXTO/VOZ =================

  // Llama al backend y aplica los items devueltos al carrito local
  const aplicarCarritoDesdeBackend = async (texto: string) => {
    const textoLimpio = texto.trim()
    if (!textoLimpio) {
      toast.error('Escribe o dicta una orden para armar el carrito.')
      return
    }

    try {
      // TODO: reemplazar por el id real del usuario autenticado
      const usuarioId = '00000000-0000-0000-0000-000000000000'

      const response = await api.post<CarritoVozResponse>(
        'carrito-voz/carrito-voz/',
        {
          usuario_id: usuarioId,
          texto: textoLimpio,
          limite_items: 10,
        }
      )

      const data = response.data

      if (!data.items || data.items.length === 0) {
        toast.error(data.mensaje || 'No se detectaron productos en tu orden.')
        return
      }

      const carritoActual = getCarrito()
      let totalUnidadesAgregadas = 0

      data.items.forEach((item) => {
        const actual = carritoActual[item.producto_id] || 0
        const nuevaCantidad = actual + item.cantidad
        actualizarCantidad(item.producto_id, nuevaCantidad)
        carritoActual[item.producto_id] = nuevaCantidad
        totalUnidadesAgregadas += item.cantidad
      })

      setTextoCarrito('')

      toast.success(
        `Se agregaron ${totalUnidadesAgregadas} producto(s) al carrito desde tu orden.`,
        {
          icon: '🛒',
          style: {
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
            color: '#fff',
            fontWeight: 'bold',
          },
        }
      )
    } catch (err) {
      console.error('Error al armar carrito por texto/voz:', err)
      toast.error('Ocurrió un error al interpretar tu orden.')
    }
  }

  const handleArmarCarritoPorTexto = () => {
    aplicarCarritoDesdeBackend(textoCarrito)
  }

  const handleArmarCarritoPorVoz = () => {
    if (!vozDisponible) {
      toast.error('Tu navegador no soporta reconocimiento de voz.')
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setEscuchando(true)
      toast('Escuchando... habla ahora 👂', {
        icon: '🎙️',
      })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event)
      setEscuchando(false)
      toast.error('Hubo un problema al escuchar tu voz.')
    }

    recognition.onend = () => {
      setEscuchando(false)
    }

    recognition.onresult = (event: any) => {
      const transcripcion = event.results[0][0].transcript as string
      setTextoCarrito(transcripcion)
      aplicarCarritoDesdeBackend(transcripcion)
    }

    recognition.start()
  }

  // ================= RENDER =================

  if (loading || loadingFilters) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="text-center py-12 sm:py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-500 text-base sm:text-lg mt-4">Cargando productos...</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">¡Nuevos Productos Cada Semana!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Catálogo de Productos
          </h1>
          <p className="text-sm sm:text-base text-gray-700">Descubre nuestros electrodomésticos de alta calidad</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-r from-white to-purple-50 rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border-2 border-purple-100">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    placeholder="Buscar productos increíbles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-600 hover:shadow-xl transition-all text-sm sm:text-base whitespace-nowrap"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2">
                <Filter className="text-purple-500 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <select
                  value={selectedMarca}
                  onChange={(e) => handleMarcaChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-semibold text-purple-700"
                >
                  <option value="">Todas las Marcas</option>
                  {filtros?.marcas.map(marca => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex items-center gap-2">
                <Package className="text-purple-500 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <select
                  value={selectedTipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-semibold text-purple-700"
                >
                  <option value="">Todos los Tipos</option>
                  {filtros?.tipos.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* NUEVA SECCIÓN: Armar carrito por texto / voz */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-purple-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-purple-700 mb-1">
                Armar carrito por texto o voz
              </label>
              <input
                type="text"
                placeholder='Ej: "agrega dos refrigeradores Samsung y una cocina LG"'
                value={textoCarrito}
                onChange={(e) => setTextoCarrito(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleArmarCarritoPorTexto()}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
            </div>
            <div className="flex flex-row gap-2 sm:flex-col sm:gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleArmarCarritoPorTexto}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-600 hover:shadow-xl transition-all text-sm sm:text-base"
              >
                Construir carrito
              </button>
              <button
                type="button"
                onClick={handleArmarCarritoPorVoz}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-purple-300 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all text-sm sm:text-base"
              >
                {escuchando ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Escuchando...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Hablar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {productos.map(producto => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No se encontraron productos con esos criterios</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
