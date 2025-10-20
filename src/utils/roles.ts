// src/utils/roles.ts

export const ROLES = {
  CLIENTE: { id: 1, nombre: 'Cliente' },
  ADMINISTRADOR: { id: 2, nombre: 'Administrador' },
  ANALISTA: { id: 3, nombre: 'Analista' },
  VENDEDOR: { id: 4, nombre: 'Vendedor' }
} as const

export const ROLES_LIST = Object.values(ROLES)

export function getRoleColor(roleName: string): string {
  const colors: Record<string, string> = {
    'Administrador': 'from-red-500 to-red-600',
    'Vendedor': 'from-blue-500 to-blue-600',
    'Analista': 'from-green-500 to-green-600',
    'Cliente': 'from-purple-500 to-purple-600'
  }
  return colors[roleName] || 'from-gray-500 to-gray-600'
}

export function getRoleIcon(roleName: string): string {
  const icons: Record<string, string> = {
    'Administrador': '👑',
    'Vendedor': '💼',
    'Analista': '📊',
    'Cliente': '�️'
  }
  return icons[roleName] || '👤'
}
