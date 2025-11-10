import { useState, useEffect } from 'react'
import { Package, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ProtectedLayout from '../components/ProtectedLayout'
import CatalogoTable from '../components/catalogos/CatalogoTable'
import CatalogoModal from '../components/catalogos/CatalogoModal'
import { useAdminCheck } from '../hooks/useAdminCheck'
import {
  listarTiposProducto,
  crearTipoProducto,
  actualizarTipoProducto,
  eliminarTipoProducto,
  getCatalogoError,
  type TipoProducto
} from '../services/gestionCatalogos'

export default function GestionTiposProductoPage() {
  const { isAdmin, isLoading: checkingAdmin } = useAdminCheck()
  const [tipos, setTipos] = useState<TipoProducto[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoProducto | null>(null)

  useEffect(() => {
    if (isAdmin && !checkingAdmin) {
      cargarTipos()
    }
  }, [isAdmin, checkingAdmin])

  const cargarTipos = async () => {
    setLoading(true)
    try {
      const data = await listarTiposProducto()
      setTipos(data)
    } catch (error) {
      toast.error(getCatalogoError(error), {
        icon: '❌',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTipo(null)
    setModalOpen(true)
  }

  const handleEdit = (tipo: TipoProducto) => {
    setEditingTipo(tipo)
    setModalOpen(true)
  }

  const handleSubmit = async (nombre: string) => {
    try {
      if (editingTipo) {
        await actualizarTipoProducto(editingTipo.id, { nombre })
        toast.success('Tipo de producto actualizado exitosamente', {
          icon: '✅',
          duration: 3000
        })
      } else {
        await crearTipoProducto({ nombre })
        toast.success('Tipo de producto creado exitosamente', {
          icon: '🎉',
          duration: 3000
        })
      }
      await cargarTipos()
      setModalOpen(false)
    } catch (error) {
      toast.error(getCatalogoError(error), {
        icon: '❌',
        duration: 4000
      })
      throw error
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await eliminarTipoProducto(id)
      toast.success(result.detail || 'Tipo de producto eliminado exitosamente', {
        icon: '🗑️',
        duration: 3000
      })
      await cargarTipos()
    } catch (error) {
      toast.error(getCatalogoError(error), {
        icon: '❌',
        duration: 5000
      })
    }
  }

  if (checkingAdmin) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/gestion-comercial"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a Gestión Comercial</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gestión de Tipos de Producto
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base mt-1">
                Crea, edita y elimina tipos de productos para el catálogo
              </p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <CatalogoTable
          items={tipos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          emptyMessage="No hay tipos de producto registrados"
        />

        {/* Modal */}
        <CatalogoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          title={editingTipo ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
          initialValue={editingTipo?.nombre || ''}
          isEditing={!!editingTipo}
        />
      </div>
    </ProtectedLayout>
  )
}
