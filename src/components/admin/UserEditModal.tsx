// src/components/admin/UserEditModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { ROLES_LIST } from '../../utils/roles'
import type { UserWithRoles } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

interface UserEditModalProps {
  user: UserWithRoles
  onClose: () => void
  onSave: (userId: string, profileData: { nombre: string; telefono: string }, rolesIds: number[]) => Promise<void>
}

export default function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [nombre, setNombre] = useState(user.nombre)
  const [telefono, setTelefono] = useState(user.telefono || '')
  const [selectedRoles, setSelectedRoles] = useState<number[]>(user.roles_ids)
  const [loading, setLoading] = useState(false)

  const toggleRole = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(user.id, { nombre, telefono }, selectedRoles)
      onClose()
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-100">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-900">✏️ Editar Usuario</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Email (readonly) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Correo Electrónico
              </label>
              <input
                type="text"
                value={user.correo}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-gray-300 bg-gray-100 text-gray-600"
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-1.5 sm:mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Roles */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2 sm:mb-3">
                Roles Asignados
              </label>
              <div className="space-y-2 bg-purple-50 p-3 sm:p-4 rounded-xl">
                {ROLES_LIST.map((role) => (
                  <label key={role.id} className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-purple-100 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{role.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
