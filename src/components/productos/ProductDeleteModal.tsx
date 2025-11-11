// src/components/productos/ProductDeleteModal.tsx
import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { Producto } from '../../types/producto'
import LoadingSpinner from '../common/LoadingSpinner'

interface ProductDeleteModalProps {
  producto: Producto
  onClose: () => void
  onDelete: (id: number) => Promise<void>
}

export default function ProductDeleteModal({
  producto,
  onClose,
  onDelete
}: ProductDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await onDelete(producto.id)
      // ❌ NO cerrar aquí, el padre cierra después de recargar la lista
      // onClose()
    } catch (err) {
      // Manejo específico del error 409 (producto con ventas)
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el producto'
      if (errorMessage.includes('ventas asociadas')) {
        setError('No se puede eliminar este producto porque tiene ventas asociadas.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-900">Eliminar Producto</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Producto info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/80?text=Sin+Imagen'
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                {producto.nombre}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Precio: <span className="font-semibold">S/ {producto.precio.toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Stock: <span className="font-semibold">{producto.stock} unidades</span>
              </p>
            </div>
          </div>

          {/* Warnings */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base text-gray-700">
              ¿Estás seguro de que deseas eliminar este producto?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs sm:text-sm text-yellow-800">
                ⚠️ <strong>Advertencia:</strong> Esta acción no se puede deshacer.
              </p>
              <p className="text-xs sm:text-sm text-yellow-800 mt-1">
                📸 La imagen del producto también será eliminada del almacenamiento.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs sm:text-sm text-red-800">
                ❌ <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Eliminando...</span>
              </>
            ) : (
              'Eliminar Producto'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
