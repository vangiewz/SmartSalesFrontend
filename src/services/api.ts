// src/services/api.ts
import { api } from '../lib/client'

export interface UserWithRoles {
  id: string
  correo: string
  nombre: string
  telefono: string | null
  roles: string[]
  roles_ids: number[]
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
// Módulo: Roles del Usuario Autenticado
// ============================================

export async function getMyRoles(): Promise<MyRolesResponse> {
  const { data } = await api.get('rolesusuario/me/')
  return data
}

export async function checkUserRole(roleName?: string, roleId?: number): Promise<{
  has_role: boolean
  role_id: number | null
  role_name: string | null
}> {
  const params = new URLSearchParams()
  if (roleName) params.append('role_name', roleName)
  if (roleId) params.append('role_id', roleId.toString())
  
  const { data } = await api.get(`rolesusuario/check/?${params}`)
  return data
}

// ============================================
// Módulo: Gestión de Usuarios (Admin Only)
// ============================================

export async function getUsers(
  search?: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserWithRoles[]> {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  params.append('limit', limit.toString())
  params.append('offset', offset.toString())
  
  const { data } = await api.get(`gestionusuario/usuarios/?${params}`)
  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: { nombre?: string; telefono?: string }
): Promise<UserWithRoles> {
  const { data } = await api.patch(`gestionusuario/usuarios/${userId}/perfil`, profileData)
  return data
}

export async function updateUserRoles(
  userId: string,
  rolesIds: number[]
): Promise<UserWithRoles> {
  const { data } = await api.put(`gestionusuario/usuarios/${userId}/roles`, {
    roles_ids: rolesIds
  })
  return data
}

export async function addUserRole(
  userId: string,
  roleId: number
): Promise<UserWithRoles> {
  const { data } = await api.post(`gestionusuario/usuarios/${userId}/roles`, {
    rol_id: roleId
  })
  return data
}

export async function removeUserRole(
  userId: string,
  roleId: number
): Promise<UserWithRoles> {
  const { data } = await api.delete(`gestionusuario/usuarios/${userId}/roles/${roleId}`)
  return data
}

export async function deleteUser(userId: string): Promise<boolean> {
  const response = await api.delete(`gestionusuario/usuarios/${userId}`)
  return response.status === 204
}

// Helper para manejar errores
export function getApiError(error: unknown): string {
  const err = error as { response?: { data?: { detail?: string; message?: string } }; message?: string }
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'Error desconocido'
  )
}
