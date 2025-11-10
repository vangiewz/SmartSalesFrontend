import { useState } from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface CatalogoItem {
  id: number
  nombre: string
}

interface CatalogoTableProps<T extends CatalogoItem> {
  items: T[]
  loading: boolean
  onEdit: (item: T) => void
  onDelete: (id: number) => void
  onCreate: () => void
  emptyMessage: string
}

export default function CatalogoTable<T extends CatalogoItem>({
  items,
  loading,
  onEdit,
  onDelete,
  onCreate,
  emptyMessage
}: CatalogoTableProps<T>) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = (item: T) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar "${item.nombre}"? Esta acción no se puede deshacer.`
    )

    if (!confirmar) return

    setDeletingId(item.id)
    onDelete(item.id)
  }

  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-gray-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header con botón crear */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Total: {items.length} {items.length === 1 ? 'registro' : 'registros'}
        </h3>
        <button
          onClick={onCreate}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white text-purple-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          <span>Crear Nuevo</span>
        </button>
      </div>

      {/* Tabla o mensaje vacío */}
      {items.length === 0 ? (
        <div className="p-12 text-center">
          <div className="bg-purple-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          <p className="text-gray-600 font-semibold mb-2">{emptyMessage}</p>
          <p className="text-gray-400 text-sm mb-4">
            Haz clic en "Crear Nuevo" para agregar el primer registro
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-purple-50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    #{item.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-medium">
                    {item.nombre}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        disabled={loading}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={loading || deletingId === item.id}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar"
                      >
                        {deletingId === item.id ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
