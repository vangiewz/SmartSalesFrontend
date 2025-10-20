// src/components/admin/UserDeleteModal.tsx
import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import type { UserWithRoles } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

interface UserDeleteModalProps {
  user: UserWithRoles
  onClose: () => void
  onConfirm: (userId: string) => Promise<void>
}

export default function UserDeleteModal({ user, onClose, onConfirm }: UserDeleteModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(user.id)
      onClose()
    } catch (error) {
      console.error('Error al eliminar:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-auto overflow-y-auto">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-4 sm:p-6 border-b border-red-100 gap-2">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-red-900 leading-tight">Confirmar Eliminación</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 p-1 flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
            ¿Estás seguro de eliminar al siguiente usuario?
          </p>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-bold text-red-900">Correo:</span>
                <span className="text-xs sm:text-sm text-gray-700 sm:ml-2 break-all">{user.correo}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="text-xs sm:text-sm font-bold text-red-900">Nombre:</span>
                <span className="text-xs sm:text-sm text-gray-700 sm:ml-2">{user.nombre}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-900 font-semibold mb-2">
              ⚠️ Esta acción NO se puede deshacer.
            </p>
            <ul className="text-xs sm:text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>El usuario será eliminado de Supabase Auth</li>
              <li>Todos sus datos locales serán borrados</li>
              <li>Sus asignaciones de roles se eliminarán</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-red-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <span>Eliminar Usuario</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
