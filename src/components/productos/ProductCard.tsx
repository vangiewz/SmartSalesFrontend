// src/components/productos/ProductCard.tsx
import { Edit2, Trash2, ShieldCheck } from 'lucide-react'
import type { Producto } from '../../types/producto'
import StockBadge from './StockBadge'

interface ProductCardProps {
  producto: Producto
  onEdit: (producto: Producto) => void
  onDelete: (producto: Producto) => void
  marcaNombre?: string
  tipoNombre?: string
}

export default function ProductCard({
  producto,
  onEdit,
  onDelete,
  marcaNombre,
  tipoNombre
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-100 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-200">
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen'
          }}
        />
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Nombre */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12 text-sm sm:text-base">
          {producto.nombre}
        </h3>

        {/* Marca y Tipo */}
        <div className="flex flex-wrap gap-2 mb-3">
          {marcaNombre && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">
              {marcaNombre}
            </span>
          )}
          {tipoNombre && (
            <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-lg font-medium">
              {tipoNombre}
            </span>
          )}
        </div>

        {/* Precio */}
        <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {formatPrice(producto.precio)}
        </p>

        {/* Stock */}
        <div className="mb-3">
          <StockBadge stock={producto.stock} />
        </div>

        {/* Garantía */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-600">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>Garantía: {producto.tiempogarantia} días</span>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(producto)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
          <button
            onClick={() => onDelete(producto)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
