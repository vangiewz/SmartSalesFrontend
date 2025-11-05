import { api } from '../lib/client'

export interface Client {
  id: string
  nombre: string
  telefono: string | null
  correo: string | null
}

export interface MyRolesResponse {
  user_id: string
  correo: string
  nombre: string
  telefono: string | null
  roles: string[]
  roles_ids: number[]
  is_admin: boolean
  is_vendedor: boolean
  is_analista: boolean
  is_usuario: boolean
}

// ============================================
// Módulo: Clientes
// ============================================

export async function getClients(
  search?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Client[]> {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('limit', limit.toString())
  params.append('offset', offset.toString())

  const { data } = await api.get(`gestionclientes/clientes/?${params}`)
  return data
}

export async function updateClientProfile(
  clientId: string,
  profileData: { nombre?: string; telefono?: string; correo?: string }
): Promise<Client> {
  const { data } = await api.patch(`gestionclientes/clientes/${clientId}/`, profileData)
  return data
}

export async function deleteClient(clientId: string): Promise<boolean> {
  const response = await api.delete(`gestionclientes/clientes/${clientId}/`)
  return response.status === 204
}

// ============================================
// Módulo: Roles del Usuario Autenticado
// (reutilizado para comprobar my roles desde la UI)
// ============================================

export async function getMyRoles(): Promise<MyRolesResponse> {
  const { data } = await api.get('rolesusuario/me/')
  return data
}

// Helper para manejar errores (mismo comportamiento que src/services/api.ts)
export function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { detail?: string; message?: string } }; message?: string }
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'Error desconocido'
  )
}

export type { Client as ClientType, MyRolesResponse as MyRolesType }
export default {
  getClients,
  updateClientProfile,
  deleteClient,
  getMyRoles,
  getApiError,
}