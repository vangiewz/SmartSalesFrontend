import { Link } from "react-router-dom";
import { ShieldCheck, Settings } from "lucide-react";

import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

export default function AdministracionPage() {
  // Permitir acceso a Admin, Analista y Vendedor
  const { isAllowed, loading } = useAllowedRoles(["admin", "vendedor", "analista"]);
  // Mostrar tarjetas especiales solo para Admin
  const { isAllowed: isAdmin, loading: adminLoading } = useAllowedRoles(["admin"]);

  if (loading || adminLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!isAllowed) {
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-yellow-800 font-semibold mb-2 text-sm sm:text-base">
              ⚠️ No tienes acceso al panel de administración
            </p>
            <p className="text-yellow-700 text-xs sm:text-sm">
              Esta sección está limitada a usuarios con roles de Administrador, Vendedor o Analista.
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent truncate">
                Panel de Administración
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Accede a herramientas de auditoría y gestión del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card: Bitácora del Sistema (solo Admin) */}
          {isAdmin && (
            <Link
              to="/bitacora"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-indigo-900 flex-1 min-w-0">
                  Bitácora del Sistema
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Consulta los registros de auditoría y cambios realizados en las tablas del sistema.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Ver Bitácora</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          )}

          {/* Card: Configurar parámetros del negocio (UC-32, solo Admin) */}
          {isAdmin && (
            <Link
              to="/config-param"
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-emerald-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-emerald-900 flex-1 min-w-0">
                  Configurar parámetros del negocio
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
                Ajusta umbrales de stock, condiciones comerciales, parámetros de IA y notificaciones
                globales del sistema SmartSales365.
              </p>
              <div className="text-[11px] sm:text-xs text-emerald-700 mb-2">
                • Solo Administrador &nbsp;• Validaciones en tiempo real &nbsp;• Mensajes de guardado
                exitoso
              </div>
              <div className="flex items-center text-emerald-700 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
                <span>Abrir configuración global</span>
                <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          )}

          {/* Placeholder si no hay herramientas de Admin visibles */}
          {!isAdmin && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-indigo-300 p-4 sm:p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-indigo-600 text-base sm:text-lg font-semibold mb-1 flex items-center justify-center gap-2">
                  🔐 No hay herramientas adicionales disponibles
                </p>
                <p className="text-indigo-400 text-xs sm:text-sm">
                  Solo los administradores pueden ver herramientas avanzadas de configuración y
                  auditoría.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
