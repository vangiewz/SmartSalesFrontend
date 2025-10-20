// src/pages/AccesosCuentas.tsx
import { Link } from 'react-router-dom'
import { Users, Shield } from 'lucide-react'
import { useAdminCheck } from '../hooks/useAdminCheck'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ProtectedLayout from '../components/ProtectedLayout'

export default function AccesosCuentasPage() {
  const { isAdmin, isLoading } = useAdminCheck()

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    )
  }

  if (!isAdmin) {
    return null // El hook ya redirige
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Accesos y Cuentas
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Panel de administración del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card: Gestionar Usuarios y Roles */}
          <Link
            to="/gestion-usuarios"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                Gestionar Usuarios
              </h2>
            </div>
            
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Administra cuentas de usuarios, asigna roles y permisos en el sistema.
            </p>
            
            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Ver Gestión</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Placeholder para futuras opciones administrativas */}
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-purple-300 p-4 sm:p-6 flex items-center justify-center opacity-50">
            <p className="text-gray-500 text-center text-sm sm:text-base">
              Más opciones próximamente...
            </p>
          </div>

        </div>
      </div>
    </ProtectedLayout>
  )
}

