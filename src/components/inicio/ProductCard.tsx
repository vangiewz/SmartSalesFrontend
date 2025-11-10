// src/components/inicio/ProductCard.tsx
import { ShoppingCart, Sparkles, Package, User } from 'lucide-react'
import type { ProductoCatalogo } from '../../types/catalogo'
import { formatearPrecio, getImagenUrl } from '../../services/catalogoApi'
import { agregarAlCarrito } from '../../utils/carrito'

interface ProductCardProps {
  producto: ProductoCatalogo
  onAddToCart: (nombre: string) => void
}

export function ProductCard({ producto, onAddToCart }: ProductCardProps) {
  const isAgotado = producto.stock <= 0

  const handleAddToCart = () => {
    if (isAgotado) return
    
    agregarAlCarrito(producto.id, 1)
    // Solo llamar a onAddToCart sin mostrar toast aquí
    // El toast se muestra en el padre (Inicio.tsx)
    onAddToCart(producto.nombre)
  }

  return (
    <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-purple-100">
      {/* Imagen del producto */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
        <img 
          src={getImagenUrl(producto.imagen_url)} 
          alt={producto.nombre}
          className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
        />
        
        {/* Badge agotado */}
        {isAgotado && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg">
              Agotado
            </span>
          </div>
        )}
        
        {/* Badge disponible */}
        {!isAgotado && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
            ¡Disponible!
          </div>
        )}
        
        {/* Stock badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-purple-700 shadow-md">
          <Package className="inline-block w-3 h-3 mr-1" />
          {producto.stock}
        </div>
      </div>
      
      {/* Contenido de la card */}
      <div className="p-3 sm:p-4">
        {/* Marca */}
        <div className="flex items-center gap-1 mb-1">
          <Sparkles className="h-3 w-3 text-purple-500" />
          <p className="text-[10px] sm:text-xs text-purple-600 font-bold">
            {producto.marca.nombre}
          </p>
        </div>
        
        {/* Nombre del producto */}
        <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1.5 sm:mb-2 line-clamp-2 text-gray-800">
          {producto.nombre}
        </h3>
        
        {/* Tipo de producto */}
        <div className="flex items-center gap-1 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-200">
            {producto.tipoproducto.nombre}
          </span>
        </div>

        {/* Vendedor */}
        <div className="flex items-center text-xs text-gray-600 mb-2 bg-purple-50 rounded-lg p-2">
          <User className="w-3 h-3 mr-1.5 text-purple-500 flex-shrink-0" />
          <span className="truncate">
            <span className="font-semibold">Vendedor:</span> {producto.vendedor.nombre}
          </span>
        </div>
        
        {/* Precio y botón */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t-2 border-purple-100">
          <p className="text-lg sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
            {formatearPrecio(producto.precio)}
          </p>
          <button 
            onClick={handleAddToCart}
            disabled={isAgotado}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-1.5 sm:p-2 rounded-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex-shrink-0 group"
          >
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
