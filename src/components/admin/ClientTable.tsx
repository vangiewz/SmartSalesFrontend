import React from 'react'
import type { Client } from '../../services/clientApi'
import { Edit3, Trash2 } from 'lucide-react'

type Props = {
  clients?: Client[] | null
  currentUserId?: string
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export default function ClientTable({ clients, currentUserId, onEdit, onDelete }: Props) {
  const list = Array.isArray(clients) ? clients : []

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {list.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No hay clientes para mostrar.
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{c.nombre}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{c.correo ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{c.telefono ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => onEdit(c)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
                      title="Editar cliente"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => onDelete(c)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}