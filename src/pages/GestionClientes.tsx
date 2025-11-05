import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAllowedRoles } from '../hooks/useAllowedRoles'
import {
  getClients,
  updateClientProfile,
  deleteClient,
  getApiError,
  getMyRoles,
} from '../services/clientApi'
import type { Client } from '../services/clientApi'
import SearchBar from '../components/admin/SearchBar'
import ClientTable from '../components/admin/ClientTable'
import ClientEditModal from '../components/admin/ClientEditModal'
import ClientDeleteModal from '../components/admin/ClientDeleteModal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ProtectedLayout from '../components/ProtectedLayout'

export default function GestionClientesPage() {
  // Permitimos solo admin y vendedor
  const { isAllowed, loading: rolesLoading } = useAllowedRoles(['admin', 'vendedor'])

  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  // Cargar clientes y myRoles (solo si está permitido)
  useEffect(() => {
    if (!isAllowed) {
      // no autorizado o aún sin permisos: limpiamos lista y dejamos loading=false
      setClients([])
      setFilteredClients([])
      setLoading(false)
      return
    }

    async function loadData() {
      setLoading(true)
      try {
        const [clientsData, myRolesData] = await Promise.all([getClients(), getMyRoles()])
        setClients(clientsData)
        setFilteredClients(clientsData)
        setCurrentUserId(myRolesData.user_id)
      } catch (error) {
        toast.error(getApiError(error))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAllowed])

  // Filtrar clientes en tiempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = clients.filter(
      client =>
        (client.correo ?? '').toLowerCase().includes(term) ||
        (client.nombre ?? '').toLowerCase().includes(term) ||
        (client.telefono ?? '').toLowerCase().includes(term)
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  // Guardar cambios del cliente (perfil)
  const handleSaveClient = async (clientId: string, profileData: { nombre: string; telefono?: string; correo?: string }) => {
    try {
      await updateClientProfile(clientId, profileData)

      // Refrescar lista
      const updatedClients = await getClients()
      setClients(updatedClients)

      toast.success('✅ Cliente actualizado correctamente', {
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

  // Eliminar cliente
  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId)

      // Refrescar lista
      const updatedClients = await getClients()
      setClients(updatedClients)

      toast.success('✅ Cliente eliminado del sistema', {
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

  // Mientras se verifica roles mostramos spinner
  if (rolesLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    )
  }

  // Si no está permitido, no mostramos la página (puedes cambiar por 403/una tarjeta)
  if (!isAllowed) {
    return null
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent truncate">
                Gestión de Clientes
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Crea, edita, elimina y consulta clientes para ventas y postventa
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar value={searchTerm} onChange={setSearchTerm} totalUsers={filteredClients.length} />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8 sm:py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ClientTable
            clients={filteredClients}
            currentUserId={currentUserId}
            onEdit={setEditingClient}
            onDelete={setDeletingClient}
          />
        )}
      </div>

      {/* Modals */}
      {editingClient && (
        <ClientEditModal client={editingClient} onClose={() => setEditingClient(null)} onSave={handleSaveClient} />
      )}

      {deletingClient && (
        <ClientDeleteModal client={deletingClient} onClose={() => setDeletingClient(null)} onConfirm={handleDeleteClient} />
      )}
    </ProtectedLayout>
  )
}