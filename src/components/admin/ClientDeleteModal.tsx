import React, { useState } from 'react'
import type { Client } from '../../services/clientApi'
import LoadingSpinner from '../common/LoadingSpinner'

type Props = {
  client: Client
  onClose: () => void
  onConfirm: (clientId: string) => Promise<void>
}

export default function ClientDeleteModal({ client, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(client.id)
      onClose()
    } catch (err) {
      // page-level will show error toast; keep modal open
      // eslint-disable-next-line no-console
      console.error('Error deleting client', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={() => !loading && onClose()} />

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Eliminar cliente</h3>
          </div>

          <div className="px-5 py-6">
            <p className="text-sm text-gray-700">
              ¿Estás seguro que querés eliminar al cliente <strong>{client.nombre}</strong>? Esta operación no se puede deshacer.
            </p>
          </div>

          <div className="px-5 py-3 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}