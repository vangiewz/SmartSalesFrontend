// src/pages/garantia.tsx

import { useNavigate } from 'react-router-dom';
import ProtectedLayout from '../components/ProtectedLayout';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, FileText, Plus, Settings } from 'lucide-react';

export default function GarantiaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Detectar roles del usuario
  const isTecnico = user?.roles_ids?.includes(5) ?? false;
  const isAdmin = user?.roles_ids?.includes(2) ?? false;
  const isCliente = user?.roles_ids?.includes(1) ?? false;

  // Debug: log de roles
  console.log('🔍 Debug Garantía:', {
    user_id: user?.id,
    roles_ids: user?.roles_ids,
    isTecnico,
    isAdmin,
    isCliente
  });

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestión de garantías
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Administra reclamos de garantía sobre productos comprados
          </p>
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Mis garantías (TODOS los usuarios) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick('/garantia/mis')}
            onKeyDown={(e) => handleCardKeyDown(e, '/garantia/mis')}
            className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-purple-400 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-purple-900">Mis garantías</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Consulta el estado de tus reclamos de garantía
            </p>
            <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all">
              <span>Ver listado</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Card 2: Reclamar garantía (Para clientes y técnicos, NO solo para admins) */}
          {(isCliente || isTecnico) && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('/garantia/reclamar')}
              onKeyDown={(e) => handleCardKeyDown(e, '/garantia/reclamar')}
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-purple-400 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-purple-900">Reclamar garantía</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Solicita garantía sobre un producto comprado
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all">
                <span>Crear reclamo</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}

          {/* Card 3: Gestión técnica (SOLO para Técnicos o Admins) */}
          {(isTecnico || isAdmin) && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('/garantia/gestionar')}
              onKeyDown={(e) => handleCardKeyDown(e, '/garantia/gestionar')}
              className="group bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl border-2 border-purple-200 p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-purple-400 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-purple-900">Gestión técnica</h2>
              </div>
              <p className="text-gray-700 mb-4">
                Evalúa y resuelve reclamos de garantía pendientes
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 transition-all">
                <span>Ver todos</span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje informativo para admins */}
        {isAdmin && !isTecnico && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-blue-900 font-semibold mb-1">Acceso de Administrador</p>
                <p className="text-blue-800 text-sm">
                  Como administrador, puedes consultar el listado completo de garantías pero no puedes evaluarlas. 
                  Solo los técnicos pueden aprobar, reparar o rechazar reclamos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
