// src/pages/GestionComercial.tsx
import { Link } from 'react-router-dom'
import { Package, TrendingUp } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ProtectedLayout from '../components/ProtectedLayout'

export default function GestionComercialPage() {
  const { user } = useAuth()

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Gestión Comercial
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Administra productos y módulos comerciales del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card: Gestionar Productos (Solo Admin y Vendedor) */}
          {(user?.is_admin || user?.is_vendedor) && (
            <Link
              to="/gestion-productos"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                  Gestionar Productos
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Administra el catálogo de productos, precios, stock e imágenes.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Ver Gestión</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* Placeholder: Más opciones próximamente */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-purple-300 p-4 sm:p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-purple-600 text-base sm:text-lg font-semibold mb-1 flex items-center justify-center gap-2">
                <TrendingUp className="inline-block w-5 h-5 text-purple-400" />
                Más opciones próximamente
              </p>
              <p className="text-purple-400 text-xs sm:text-sm">
                Pronto podrás acceder a más módulos comerciales.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje si no tiene permisos */}
        {!user?.is_admin && !user?.is_vendedor && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes acceso a módulos comerciales
            </p>
            <p className="text-yellow-700 text-sm">
              Contacta al administrador para obtener permisos de Vendedor o Administrador
            </p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
