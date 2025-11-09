import { Link } from "react-router-dom";
import { FileText, CalendarClock } from "lucide-react";

import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

export default function ReportesPage() {
  // Permitir acceso a Admin, Analista y Vendedor
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "admin",
    "analista",
    "vendedor",
  ]);

  if (rolesLoading) {
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
              ⚠️ No tienes acceso al módulo de reportes
            </p>
            <p className="text-yellow-700 text-xs sm:text-sm">
              Esta sección está limitada a usuarios con roles de{" "}
              <span className="font-semibold">Administrador, Analista o Vendedor</span>.
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
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Reportes IA
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Genera y administra reportes inteligentes del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card: Generar Reporte con IA */}
          <Link
            to="/generar-reporte"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                Generar reporte con IA
              </h2>
            </div>

            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Utiliza inteligencia artificial para crear reportes detallados y personalizados en el momento.
            </p>

            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Generar ahora</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* Card: Programar reportes automáticos */}
          <Link
            to="/program-reporte"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <CalendarClock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-900 flex-1 min-w-0">
                Programar reportes automáticos
              </h2>
            </div>

            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Define reportes recurrentes, por ejemplo un reporte de productos cada 3 meses, con entrega automática.
            </p>

            <div className="text-[11px] sm:text-xs text-indigo-700 mb-2">

            </div>

            <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Configurar programación</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>
        </div>
      </div>
    </ProtectedLayout>
  );
}
