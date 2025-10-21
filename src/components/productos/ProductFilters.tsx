// src/components/productos/ProductFilters.tsx
import { Search } from 'lucide-react'
import type { Marca, TipoProducto } from '../../types/producto'

interface ProductFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  marcaId: number | undefined
  onMarcaChange: (value: number | undefined) => void
  tipoId: number | undefined
  onTipoChange: (value: number | undefined) => void
  minPrecio: number | undefined
  onMinPrecioChange: (value: number | undefined) => void
  maxPrecio: number | undefined
  onMaxPrecioChange: (value: number | undefined) => void
  marcas: Marca[]
  tipos: TipoProducto[]
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  marcaId,
  onMarcaChange,
  tipoId,
  onTipoChange,
  minPrecio,
  onMinPrecioChange,
  maxPrecio,
  onMaxPrecioChange,
  marcas,
  tipos
}: ProductFiltersProps) {
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 p-3 sm:p-4 shadow-lg mb-4 sm:mb-6">
      {/* Búsqueda */}
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
          />
        </div>
      </div>

      {/* Filtros en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Marca */}
        <div>
          <label className="block text-xs font-semibold text-purple-900 mb-1.5">
            Marca
          </label>
          <select
            value={marcaId || ''}
            onChange={(e) => onMarcaChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">Todas las marcas</option>
            {marcas.map((marca) => (
              <option key={marca.id} value={marca.id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-semibold text-purple-900 mb-1.5">
            Tipo
          </label>
          <select
            value={tipoId || ''}
            onChange={(e) => onTipoChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Precio mínimo */}
        <div>
          <label className="block text-xs font-semibold text-purple-900 mb-1.5">
            Precio mínimo
          </label>
          <input
            type="number"
            placeholder="S/ 0.00"
            value={minPrecio || ''}
            onChange={(e) => onMinPrecioChange(e.target.value ? Number(e.target.value) : undefined)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>

        {/* Precio máximo */}
        <div>
          <label className="block text-xs font-semibold text-purple-900 mb-1.5">
            Precio máximo
          </label>
          <input
            type="number"
            placeholder="S/ 9999.99"
            value={maxPrecio || ''}
            onChange={(e) => onMaxPrecioChange(e.target.value ? Number(e.target.value) : undefined)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          />
        </div>
      </div>
    </div>
  )
}
