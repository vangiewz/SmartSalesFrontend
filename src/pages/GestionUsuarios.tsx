// src/pages/GestionUsuarios.tsx
import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAdminCheck } from '../hooks/useAdminCheck'
import { getUsers, updateUserProfile, updateUserRoles, deleteUser, getApiError } from '../services/api'
import { getMyRoles } from '../services/api'
import type { UserWithRoles } from '../services/api'
import SearchBar from '../components/admin/SearchBar'
import UserTable from '../components/admin/UserTable'
import UserEditModal from '../components/admin/UserEditModal'
import UserDeleteModal from '../components/admin/UserDeleteModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ProtectedLayout from '../components/ProtectedLayout'

export default function GestionUsuariosPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck()
  
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRoles[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserWithRoles | null>(null)

  // Cargar usuarios
  useEffect(() => {
    if (!isAdmin) return
    
    async function loadData() {
      try {
        const [usersData, myRolesData] = await Promise.all([
          getUsers(),
          getMyRoles()
        ])
        
        setUsers(usersData)
        setFilteredUsers(usersData)
        setCurrentUserId(myRolesData.user_id)
      } catch (error) {
        toast.error(getApiError(error))
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [isAdmin])

  // Filtrar usuarios en tiempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = users.filter(
      user =>
        user.correo.toLowerCase().includes(term) ||
        user.nombre.toLowerCase().includes(term)
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  // Guardar cambios del usuario
  const handleSaveUser = async (
    userId: string,
    profileData: { nombre: string; telefono: string },
    rolesIds: number[]
  ) => {
    try {
      // Actualizar perfil
      await updateUserProfile(userId, profileData)
      
      // Actualizar roles
      await updateUserRoles(userId, rolesIds)
      
      // Refrescar lista
      const updatedUsers = await getUsers()
      setUsers(updatedUsers)
      
      toast.success('✅ Usuario actualizado correctamente', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
    } catch (error) {
      toast.error(getApiError(error), {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      throw error
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      
      // Refrescar lista
      const updatedUsers = await getUsers()
      setUsers(updatedUsers)
      
      toast.success('✅ Usuario eliminado del sistema', {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
    } catch (error) {
      toast.error(getApiError(error), {
        style: {
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontWeight: 'bold',
        },
      })
      throw error
    }
  }

  if (adminLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Administra cuentas, roles y permisos
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          totalUsers={filteredUsers.length}
        />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            currentUserId={currentUserId}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
          />
        )}
      </div>

      {/* Modals */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {deletingUser && (
        <UserDeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </ProtectedLayout>
  )
}
