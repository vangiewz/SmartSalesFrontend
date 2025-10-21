// src/components/productos/ProductGrid.tsx
import type { Producto, Marca, TipoProducto } from '../../types/producto'
import ProductCard from './ProductCard'

interface ProductGridProps {
  productos: Producto[]
  marcas: Marca[]
  tipos: TipoProducto[]
  onEdit: (producto: Producto) => void
  onDelete: (producto: Producto) => void
}

export default function ProductGrid({
  productos,
  marcas,
  tipos,
  onEdit,
  onDelete
}: ProductGridProps) {
  const getMarcaNombre = (marcaId: number) => {
    return marcas.find(m => m.id === marcaId)?.nombre
  }

  const getTipoNombre = (tipoId: number) => {
    return tipos.find(t => t.id === tipoId)?.nombre
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
        <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o crea un nuevo producto</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          marcaNombre={getMarcaNombre(producto.marca_id)}
          tipoNombre={getTipoNombre(producto.tipoproducto_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
