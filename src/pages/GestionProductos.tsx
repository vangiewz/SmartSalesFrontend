// src/pages/GestionProductos.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ProtectedLayout from '../components/ProtectedLayout'
import ProductFilters from '../components/productos/ProductFilters'
import ProductGrid from '../components/productos/ProductGrid'
import ProductSkeleton from '../components/productos/ProductSkeleton'
import ProductCreateModal from '../components/productos/ProductCreateModal'
import ProductEditModal from '../components/productos/ProductEditModal'
import ProductDeleteModal from '../components/productos/ProductDeleteModal'
import { useAuth } from '../hooks/useAuth'
import { useCatalogos } from '../hooks/useCatalogos'
import { useProducts } from '../hooks/useProducts'
import { createProducto, updateProducto, deleteProducto } from '../services/productosApi'
import type { Producto, ProductoFilters as Filters, ProductoFormData } from '../types/producto'

export default function GestionProductos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { marcas, tipos, loading: catalogsLoading } = useCatalogos()
  const { products, loading: productsLoading, pagination, loadProducts } = useProducts()

  // Verificar permisos
  const is_admin = user?.is_admin || false
  const is_vendedor = user?.is_vendedor || false

  useEffect(() => {
    if (!is_admin && !is_vendedor) {
      toast.error('No tienes permisos para acceder a esta sección')
      navigate('/gestion-comercial')
    }
  }, [is_admin, is_vendedor, navigate])

  // Estados de filtros
  const [filters, setFilters] = useState<Filters>({
    q: '',
    marca_id: undefined,
    tipoproducto_id: undefined,
    min_precio: undefined,
    max_precio: undefined,
    page: 1,
    page_size: 12
  })

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null)

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    if (!catalogsLoading) {
      loadProducts(filters)
    }
  }, [filters, catalogsLoading, loadProducts])

  // Handlers de filtros
  const handleSearchChange = (q: string) => {
    setFilters(prev => ({ ...prev, q, page: 1 }))
  }

  const handleMarcaChange = (marca_id: number | undefined) => {
    setFilters(prev => ({ ...prev, marca_id, page: 1 }))
  }

  const handleTipoChange = (tipoproducto_id: number | undefined) => {
    setFilters(prev => ({ ...prev, tipoproducto_id, page: 1 }))
  }

  const handleMinPrecioChange = (min_precio: number | undefined) => {
    setFilters(prev => ({ ...prev, min_precio, page: 1 }))
  }

  const handleMaxPrecioChange = (max_precio: number | undefined) => {
    setFilters(prev => ({ ...prev, max_precio, page: 1 }))
  }

  // Handlers de CRUD
  const handleCreate = async (data: ProductoFormData) => {
    try {
      await createProducto(data)
      toast.success('Producto creado exitosamente')
      await loadProducts(filters)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear producto'
      toast.error(message)
      throw error
    }
  }

  const handleUpdate = async (id: number, data: Partial<ProductoFormData>) => {
    try {
      await updateProducto(id, data)
      toast.success('Producto actualizado exitosamente')
      await loadProducts(filters)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar producto'
      toast.error(message)
      throw error
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteProducto(id)
      toast.success('Producto eliminado exitosamente')
      await loadProducts(filters)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto'
      toast.error(message)
      throw error
    }
  }

  // Handlers de paginación
  const handlePreviousPage = () => {
    setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))
  }

  const handleNextPage = () => {
    const maxPage = Math.ceil((pagination?.count || 0) / (filters.page_size || 12))
    setFilters(prev => ({ ...prev, page: Math.min(maxPage, (prev.page || 1) + 1) }))
  }

  const handlePageSizeChange = (page_size: number) => {
    setFilters(prev => ({ ...prev, page_size, page: 1 }))
  }

  const totalPages = Math.ceil((pagination?.count || 0) / (filters.page_size || 12))
  const currentPage = filters.page || 1

  if (!is_admin && !is_vendedor) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  📦 Gestión de Productos
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  {is_admin ? 'Administra todos los productos del sistema' : 'Administra tus productos'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <ProductFilters
              searchTerm={filters.q || ''}
              onSearchChange={handleSearchChange}
              marcaId={filters.marca_id}
              onMarcaChange={handleMarcaChange}
              tipoId={filters.tipoproducto_id}
              onTipoChange={handleTipoChange}
              minPrecio={filters.min_precio}
              onMinPrecioChange={handleMinPrecioChange}
              maxPrecio={filters.max_precio}
              onMaxPrecioChange={handleMaxPrecioChange}
              marcas={marcas}
              tipos={tipos}
            />
          </div>

          {/* Grid de productos */}
          {productsLoading ? (
            <ProductSkeleton />
          ) : (
            <ProductGrid
              productos={products}
              marcas={marcas}
              tipos={tipos}
              onEdit={(producto) => setEditingProduct(producto)}
              onDelete={(producto) => setDeletingProduct(producto)}
            />
          )}

          {/* Paginación */}
          {!productsLoading && products.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-md">
              {/* Info */}
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * (filters.page_size || 12)) + 1} - {Math.min(currentPage * (filters.page_size || 12), pagination?.count || 0)} de {pagination?.count || 0} productos
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                {/* Page size selector */}
                <select
                  value={filters.page_size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border-2 border-purple-200 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value={12}>12 por página</option>
                  <option value={24}>24 por página</option>
                  <option value={48}>48 por página</option>
                </select>

                {/* Page buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-purple-200 text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <span className="px-4 py-2 text-sm font-semibold text-purple-900">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-purple-200 text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <ProductCreateModal
          marcas={marcas}
          tipos={tipos}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {editingProduct && (
        <ProductEditModal
          producto={editingProduct}
          marcas={marcas}
          tipos={tipos}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdate}
        />
      )}

      {deletingProduct && (
        <ProductDeleteModal
          producto={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onDelete={handleDelete}
        />
      )}
    </ProtectedLayout>
  )
}
