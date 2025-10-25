// src/pages/Direcciones/index.tsx

import { useEffect, useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { getDirecciones, createDireccion, updateDireccion, deleteDireccion, type Direccion } from '../../services/direccionesApi';
import DireccionModal from './DireccionModal';
import toast from 'react-hot-toast';

export default function DireccionesPage() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);

  const fetchDirecciones = async () => {
    try {
      setLoading(true);
      const data = await getDirecciones();
      setDirecciones(data);
    } catch (error) {
      console.error('Error al cargar direcciones:', error);
      toast.error('Error al cargar las direcciones', {
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#374151',
          border: '2px solid #ef4444',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirecciones();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedDireccion(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
    setShowModal(true);
  };

  const handleSave = async (texto: string) => {
    try {
      if (selectedDireccion?.id) {
        await updateDireccion(selectedDireccion.id, texto);
        toast.success('Dirección actualizada exitosamente', {
          icon: '✏️',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            border: '2px solid #9333ea',
          },
        });
      } else {
        await createDireccion(texto);
        toast.success('Dirección creada exitosamente', {
          icon: '✅',
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            border: '2px solid #9333ea',
          },
        });
      }
      fetchDirecciones();
      setShowModal(false);
      setSelectedDireccion(null);
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      throw error; // Propagar error al modal
    }
  };

  const handleDelete = async (id: number) => {
    // Mostrar toast de confirmación personalizado
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-bold text-gray-900 mb-1">¿Eliminar dirección?</p>
          <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // Mostrar toast de carga
                const loadingToast = toast.loading('Eliminando dirección...', {
                  style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#374151',
                  },
                });

                await deleteDireccion(id);
                
                toast.dismiss(loadingToast);
                toast.success('Dirección eliminada exitosamente', {
                  icon: '🗑️',
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#374151',
                    border: '2px solid #9333ea',
                  },
                });
                fetchDirecciones();
              } catch (error) {
                console.error('Error al eliminar dirección:', error);
                toast.error('Error al eliminar la dirección', {
                  duration: 4000,
                  style: {
                    borderRadius: '12px',
                    background: '#fff',
                    color: '#374151',
                    border: '2px solid #ef4444',
                  },
                });
              }
            }}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-4 py-2 rounded-lg font-semibold transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '400px',
        background: '#fff',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 2px #e9d5ff',
        border: '2px solid #e9d5ff',
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDireccion(null);
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando direcciones...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mis Direcciones
              </h1>
              <p className="text-gray-600 mt-1">Administra tus direcciones de envío</p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Agregar Dirección
          </button>
        </div>

        {/* Lista de direcciones */}
        {direcciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes direcciones guardadas</h3>
            <p className="text-gray-500 mb-6">Agrega tu primera dirección de envío</p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Agregar Dirección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {direcciones.map((dir) => (
              <div
                key={dir.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-purple-200"
              >
                {/* Dirección */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{dir.direccion}</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(dir)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-all duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(dir.id!)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <DireccionModal
          direccion={selectedDireccion}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </ProtectedLayout>
  );
}
