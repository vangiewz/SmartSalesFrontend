import ProtectedLayout from '../components/ProtectedLayout'
import { Search, Filter, Star, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// Productos de ejemplo
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Refrigerador Samsung 500L',
    price: 15999,
    category: 'Refrigeradores',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',
    rating: 4.5,
    inStock: true
  },
  {
    id: 2,
    name: 'Lavadora LG 18kg',
    price: 8999,
    category: 'Lavadoras',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400',
    rating: 4.8,
    inStock: true
  },
  {
    id: 3,
    name: 'Microondas Panasonic 1.2 cu ft',
    price: 2499,
    category: 'Microondas',
    image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400',
    rating: 4.3,
    inStock: true
  },
  {
    id: 4,
    name: 'Estufa Whirlpool 6 Quemadores',
    price: 6999,
    category: 'Estufas',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    rating: 4.6,
    inStock: true
  },
  {
    id: 5,
    name: 'Licuadora Oster Pro',
    price: 1299,
    category: 'Pequeños Electrodomésticos',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400',
    rating: 4.4,
    inStock: false
  },
  {
    id: 6,
    name: 'Cafetera Nespresso Vertuo',
    price: 3499,
    category: 'Pequeños Electrodomésticos',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
    rating: 4.7,
    inStock: true
  },
  {
    id: 7,
    name: 'Aspiradora Dyson V11',
    price: 11999,
    category: 'Limpieza',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    rating: 4.9,
    inStock: true
  },
  {
    id: 8,
    name: 'Horno Eléctrico Black+Decker',
    price: 1899,
    category: 'Hornos',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
    rating: 4.2,
    inStock: true
  }
]


export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const categories = ['Todos', ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))]

  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Buscar productos increíbles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-purple-500 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-semibold text-purple-700"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-purple-100">
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition-all duration-500"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg">
                      Agotado
                    </span>
                  </div>
                )}
                {product.inStock && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    ¡Disponible!
                  </div>
                )}
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <p className="text-[10px] sm:text-xs text-purple-600 font-bold">{product.category}</p>
                </div>
                <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1.5 sm:mb-2 line-clamp-2 text-gray-800">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2 sm:mb-3">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-gray-700">{product.rating}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 truncate">(128 reseñas)</span>
                </div>
                
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-purple-100">
                  <p className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                    ${product.price.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => handleAddToCart(product.name)}
                    disabled={!product.inStock}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-1.5 sm:p-2 rounded-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex-shrink-0 group"
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <p className="text-gray-500 text-base sm:text-lg">No se encontraron productos con esos criterios</p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
