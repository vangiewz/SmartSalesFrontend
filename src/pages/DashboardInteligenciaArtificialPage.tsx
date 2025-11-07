// src/pages/DashboardInteligenciaArtificialPage.tsx
import { Link } from "react-router-dom";
import { Brain, BarChart3, Sliders, LineChart, Play, CloudCog } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

export default function DashboardInteligenciaArtificialPage() {
  // Solo Admin y Analista
  const { isAllowed, loading: rolesLoading } = useAllowedRoles(["admin", "analista"]);

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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes rol permitido para acceder a Dashboard e Inteligencia Artificial
            </p>
            <p className="text-yellow-700 text-sm">
              Esta sección está reservada para usuarios con rol Administrador o Analista.
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
            <div className="bg-gradient-to-br from-indigo-600 to-emerald-500 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-emerald-500 to-sky-500 bg-clip-text text-transparent truncate">
                Dashboard e Inteligencia Artificial
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base mt-1">
                Accede a los módulos de análisis histórico y modelos de predicción de ventas.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de casos de uso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* CU-23: Visualizar dashboard de ventas históricas */}
          <Link
            to="/historico-ventas"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-900 flex-1 min-w-0">
                CU-23: Ventas históricas
              </h2>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Analiza ventas históricas por período, producto y cliente con gráficos dinámicos.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Ir al dashboard histórico</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* CU-24: Visualizar predicciones de ventas (placeholder) */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-emerald-300 p-4 sm:p-6 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <LineChart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-emerald-900 flex-1 min-w-0">
                  CU-24: Predicciones de ventas
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-2 text-sm sm:text-base">
                Visualización de ventas futuras estimadas a partir del modelo de IA.
              </p>
            </div>
            <p className="text-emerald-500 text-xs sm:text-sm font-semibold mt-2 flex items-center gap-2">
              <CloudCog className="w-4 h-4" />
              Módulo en desarrollo
            </p>
          </div>

          {/* CU-25: Configurar parámetros del modelo de predicción */}
          <Link
            to="/config-modelo"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <Sliders className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                CU-25: Configurar modelo
              </h2>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Ajusta horizonte de predicción e hiperparámetros del modelo Random Forest.
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Ir a configuración</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* CU-26: Entrenar modelo de IA bajo demanda (placeholder) */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-sky-300 p-4 sm:p-6 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-sky-500 to-blue-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-sky-900 flex-1 min-w-0">
                  CU-26: Entrenar modelo IA
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-2 text-sm sm:text-base">
                Ejecución manual del entrenamiento del modelo de predicción de ventas.
              </p>
            </div>
            <p className="text-sky-500 text-xs sm:text-sm font-semibold mt-2 flex items-center gap-2">
              <CloudCog className="w-4 h-4" />
              Módulo en desarrollo
            </p>
          </div>

          {/* CU-27: Generar predicción bajo demanda (API) (placeholder) */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-dashed border-fuchsia-300 p-4 sm:p-6 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-fuchsia-500 to-rose-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                  <CloudCog className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-fuchsia-900 flex-1 min-w-0">
                  CU-27: Predicción bajo demanda (API)
                </h2>
              </div>
              <p className="text-gray-700 mb-3 sm:mb-2 text-sm sm:text-base">
                Endpoint de API para solicitar predicciones puntuales desde otros módulos.
              </p>
            </div>
            <p className="text-fuchsia-500 text-xs sm:text-sm font-semibold mt-2">
              Módulo en desarrollo
            </p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
