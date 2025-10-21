import ProtectedLayout from '../components/ProtectedLayout'
import { Search, Filter, Sparkles, Package } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCatalogProducts } from '../hooks/useCatalogProducts'
import { useCatalogFilters } from '../hooks/useCatalogFilters'
import { ProductCard } from '../components/inicio/ProductCard'

export default function InicioPage() {
  const [searchInput, setSearchInput] = useState('')
  const [selectedMarca, setSelectedMarca] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('')

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
