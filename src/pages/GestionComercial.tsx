import { Link } from 'react-router-dom'
import { Package, TrendingUp, MapPin, Users, Receipt, FileSpreadsheet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import ProtectedLayout from '../components/ProtectedLayout'
import HistorialPagosCard from './GestionComercial/components/HistorialPagosCard'

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
          {/* Card: Gestionar Direcciones (Visible para todos) */}
          <Link
            to="/direcciones"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                Gestionar Direcciones
              </h2>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Administra tus direcciones de envío para realizar compras más rápido.
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Ver Direcciones</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Card: Historial de Pagos (Visible para todos) */}
          <HistorialPagosCard />

          {/* Card: Histórico de Ventas (Solo Admin y Analista) */}
          {(user?.is_admin || user?.is_analista) && (
            <Link
              to="/historico-ventas"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-indigo-900 flex-1 min-w-0">
                  Histórico de Ventas
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Analiza ventas históricas por período, producto y cliente con métricas clave.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Ver histórico</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

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

          {/* Card: Gestionar Clientes (Solo Admin y Vendedor) */}
          {(user?.is_admin || user?.is_vendedor) && (
            <Link
              to="/gestioncliente"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-emerald-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-emerald-900 flex-1 min-w-0">
                  Gestión de Clientes
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Crea, edita y administra clientes para ventas y postventa.
              </p>
              <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Ir a Clientes</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* Card: Registrar Venta Manual (Solo Vendedor) */}
          {user?.is_vendedor && (
            <Link
              to="/registrar-venta-manual"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-amber-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-amber-900 flex-1 min-w-0">
                  Registrar Venta Manual
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Registra ventas en mostrador seleccionando cliente y productos de tu catálogo.
              </p>
              <div className="flex items-center text-amber-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Registrar Venta</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          )}

          {/* Card: Importar/Exportar Catálogo (Solo Vendedor) */}
          {user?.is_vendedor && (
            <Link
              to="/importar-exportar-catalogo"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-teal-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-teal-900 flex-1 min-w-0">
                  Importar/Exportar Catálogo
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Descarga plantillas, importa productos masivamente o exporta tu catálogo completo.
              </p>
              <div className="flex items-center text-teal-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Gestionar Catálogo</span>
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

        {/* Mensaje si no tiene permisos comerciales */}
        {!user?.is_admin && !user?.is_vendedor && !user?.is_analista && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes acceso a módulos comerciales
            </p>
            <p className="text-yellow-700 text-sm">
              Contacta al administrador para obtener permisos de Vendedor, Analista o Administrador.
            </p>
          </div>
        )}
      </div>
    </ProtectedLayout>
  )
}
