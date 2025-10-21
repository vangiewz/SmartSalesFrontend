// src/components/productos/ProductCreateModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import type { Marca, TipoProducto, ProductoFormData } from '../../types/producto'
import ImageUpload from './ImageUpload'
import LoadingSpinner from '../common/LoadingSpinner'

interface ProductCreateModalProps {
  marcas: Marca[]
  tipos: TipoProducto[]
  onClose: () => void
  onSave: (data: ProductoFormData) => Promise<void>
}

export default function ProductCreateModal({
  marcas,
  tipos,
  onClose,
  onSave
}: ProductCreateModalProps) {
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [tiempoGarantia, setTiempoGarantia] = useState('')
  const [marcaId, setMarcaId] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [imagen, setImagen] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (!precio || Number(precio) < 0) newErrors.precio = 'Ingresa un precio válido'
    if (!stock || Number(stock) < 0) newErrors.stock = 'Ingresa un stock válido'
    if (!tiempoGarantia || Number(tiempoGarantia) < 0) newErrors.tiempogarantia = 'Ingresa una garantía válida'
    if (!marcaId) newErrors.marca_id = 'Selecciona una marca'
    if (!tipoId) newErrors.tipoproducto_id = 'Selecciona un tipo'
    if (!imagen) newErrors.imagen = 'La imagen es obligatoria'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setLoading(true)
    try {
      await onSave({
        nombre: nombre.trim(),
        precio: Number(precio),
        stock: Number(stock),
        tiempogarantia: Number(tiempoGarantia),
        marca_id: Number(marcaId),
        tipoproducto_id: Number(tipoId),
        imagen: imagen!
      })
      onClose()
    } catch (error) {
      console.error('Error al crear producto:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-900">➕ Crear Producto</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Precio (S/) *
                </label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
              </div>
            </div>

            {/* Garantía */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">
                Garantía (días) *
              </label>
              <input
                type="number"
                value={tiempoGarantia}
                onChange={(e) => setTiempoGarantia(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              {errors.tiempogarantia && <p className="text-xs text-red-500 mt-1">{errors.tiempogarantia}</p>}
            </div>

            {/* Marca y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Marca *
                </label>
                <select
                  value={marcaId}
                  onChange={(e) => setMarcaId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
                {errors.marca_id && <p className="text-xs text-red-500 mt-1">{errors.marca_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Tipo *
                </label>
                <select
                  value={tipoId}
                  onChange={(e) => setTipoId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {errors.tipoproducto_id && <p className="text-xs text-red-500 mt-1">{errors.tipoproducto_id}</p>}
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-bold text-purple-900 mb-2">
                Imagen del Producto *
              </label>
              <ImageUpload
                value={imagen}
                onChange={setImagen}
                required
                error={errors.imagen}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creando...</span>
                </>
              ) : (
                'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
