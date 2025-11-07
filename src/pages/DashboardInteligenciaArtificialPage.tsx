// src/pages/DashboardInteligenciaArtificialPage.tsx
import { Link } from "react-router-dom";
import { Brain, BarChart3, CloudCog } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

export default function DashboardInteligenciaArtificialPage() {
  // Solo Admin y Analista
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "admin",
    "analista",
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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes rol permitido para acceder a Dashboard e Inteligencia
              Artificial
            </p>
            <p className="text-yellow-700 text-sm">
              Esta sección está reservada para usuarios con rol Administrador o
              Analista.
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
                Accede al análisis histórico de ventas, a las predicciones de
                venta y al modelo de IA para configurar y entrenar pronósticos.
              </p>
            </div>
          </div>
        </div>

        {/* Grid de secciones: solo 2 cards, responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Ventas históricas + Predicciones */}
          <Link
            to="/historico-ventas"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-indigo-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-900 flex-1 min-w-0">
                Ventas históricas y predicciones de venta
              </h2>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Analiza ventas históricas por período, producto y cliente, y
              visualiza las predicciones futuras generadas por el modelo de IA
              en un mismo módulo.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Ir al dashboard de ventas y predicciones</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* Configurar y entrenar modelo IA */}
          <Link
            to="/config-modelo"
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-4 sm:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                <CloudCog className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-purple-900 flex-1 min-w-0">
                Configurar y entrenar modelo IA
              </h2>
            </div>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              Ajusta los parámetros del modelo Random Forest y entrena el modelo
              de IA con las ventas históricas, visualizando métricas como R²,
              MAE y RMSE para evaluar su desempeño.
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all text-sm sm:text-base">
              <span>Abrir configuración y entrenamiento</span>
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
