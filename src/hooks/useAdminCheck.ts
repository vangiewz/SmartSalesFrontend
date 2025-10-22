// src/hooks/useAdminCheck.ts
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getMyRoles } from '../services/api'
import toast from 'react-hot-toast'

export function useAdminCheck() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!isAuthenticated) {
        toast.error('Debes iniciar sesión')
        navigate('/login')
        return
      }

      try {
        const rolesData = await getMyRoles()
        
        if (!rolesData.is_admin) {
          toast.error('No tienes permisos de administrador')
          navigate('/inicio')
          return
        }
        
        setIsAdmin(true)
      } catch (error) {
        console.error('Error al verificar permisos:', error)
        toast.error('Error al verificar permisos')
        navigate('/inicio')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [isAuthenticated, navigate])

  return { isAdmin, isLoading }
}
