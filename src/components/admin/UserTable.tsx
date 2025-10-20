// src/components/admin/UserTable.tsx
import { Edit2, Trash2, Mail, Phone, User } from 'lucide-react'
import RoleBadge from '../common/RoleBadge'
import type { UserWithRoles } from '../../services/api'

interface UserTableProps {
  users: UserWithRoles[]
  currentUserId: string
  onEdit: (user: UserWithRoles) => void
  onDelete: (user: UserWithRoles) => void
}

export default function UserTable({ users, currentUserId, onEdit, onDelete }: UserTableProps) {
  return (
    <>
      {/* Vista Desktop - Tabla */}
      <div className="hidden lg:block bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Correo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Roles</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-purple-100 hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm">{user.correo}</td>
                  <td className="px-6 py-4 text-sm font-medium">{user.nombre}</td>
                  <td className="px-6 py-4 text-sm">{user.telefono || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <RoleBadge key={role} roleName={role} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => onDelete(user)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Vista Móvil/Tablet - Cards */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 shadow-lg p-4 hover:shadow-xl transition-all"
          >
            {/* Header con nombre y acciones */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{user.nombre}</h3>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <button
                  onClick={() => onEdit(user)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {user.id !== currentUserId && (
                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className="text-gray-700 truncate">{user.correo}</span>
              </div>
              
              {user.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700">{user.telefono}</span>
                </div>
              )}
            </div>

            {/* Roles */}
            <div className="mt-3 pt-3 border-t border-purple-100">
              <p className="text-xs text-gray-500 mb-2 font-semibold">ROLES:</p>
              <div className="flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <RoleBadge key={role} roleName={role} />
                ))}
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 shadow-lg p-8 text-center text-gray-500">
            No se encontraron usuarios
          </div>
        )}
      </div>
    </>
  )
}
