// src/pages/Direcciones/DireccionModal.tsx

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Direccion } from '../../services/direccionesApi';

interface DireccionModalProps {
  direccion: Direccion | null;
  onClose: () => void;
  onSave: (texto: string) => Promise<void>;
}

export default function DireccionModal({ direccion, onClose, onSave }: DireccionModalProps) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (direccion) {
      setTexto(direccion.direccion);
    }
  }, [direccion]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validación
    if (texto.trim().length < 5) {
      setError('La dirección debe tener al menos 5 caracteres');
      return;
    }
    if (texto.length > 500) {
      setError('La dirección no puede exceder 500 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(texto);
    } catch (err) {
      setError('Error al guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {direccion ? 'Editar Dirección' : 'Nueva Dirección'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
              Dirección Completa <span className="text-red-500">*</span>
            </label>
            <textarea
              id="direccion"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej: Av. Siempre Viva 742, Springfield, Estado, CP 12345"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">
              {texto.length}/500 caracteres • Incluye calle, número, colonia, ciudad, estado y código postal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Dirección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
