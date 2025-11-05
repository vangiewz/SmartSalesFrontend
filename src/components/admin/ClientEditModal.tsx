import React, { useState, useEffect } from 'react'
import type { Client } from '../../services/clientApi'
import { X } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'

type Props = {
  client: Client | null | undefined
  onClose: () => void
  onSave: (clientId: string, profileData: { nombre: string; telefono?: string; correo?: string }) => Promise<void>
}

export default function ClientEditModal({ client, onClose, onSave }: Props) {
  // Si no hay cliente, no renderizamos el modal (evita crashes)
  if (!client) return null

  // Inicializar estados usando safe access y defaults
  const [nombre, setNombre] = useState<string>(client?.nombre ?? '')
  const [correo, setCorreo] = useState<string>(client?.correo ?? '')
  const [telefono, setTelefono] = useState<string>(client?.telefono ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Al cambiar el cliente, reseteamos los campos (protección adicional)
    setNombre(client?.nombre ?? '')
    setCorreo(client?.correo ?? '')
    setTelefono(client?.telefono ?? '')
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Usar safe trim para evitar calling .trim() sobre undefined/null
      const payload = {
        nombre: (nombre ?? '').trim(),
        telefono: (telefono ?? '').trim() || undefined,
        correo: (correo ?? '').trim() || undefined,
      }
      await onSave(client.id, payload)
      onClose()
    } catch (err) {
      // onSave debería mostrar toast; aquí solo logueamos
      // eslint-disable-next-line no-console
      console.error('Error saving client', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => !saving && onClose()} />

      <div className="relative w-full max-w-xl mx-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Editar Cliente</h3>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
              <X />
            </button>
          </div>

          <div className="px-5 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full border rounded px-3 py-2"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Ej: 11 1234 5678"
              />
            </div>
          </div>

          <div className="px-5 py-3 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}