// src/pages/BitacoraAuditoria.tsx
import { useEffect, useMemo, useState } from "react";
import { FileSearch } from "lucide-react";
import toast from "react-hot-toast";

import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAdminCheck } from "../hooks/useAdminCheck";

import { getApiError } from "../services/api";
import { getBitacora, type BitacoraEntry } from "../services/bitacora";

const PAGE_SIZE = 50;

export default function BitacoraAuditoriaPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();

  const [entries, setEntries] = useState<BitacoraEntry[]>([]);
  const [filtered, setFiltered] = useState<BitacoraEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [tablaFilter, setTablaFilter] = useState("");
  const [operacionFilter, setOperacionFilter] = useState("");

  const [selectedEntry, setSelectedEntry] = useState<BitacoraEntry | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  // Cargar bitácora solo si es admin
  useEffect(() => {
    if (!isAdmin) return;

    async function load() {
      try {
        setLoading(true);
        const data = await getBitacora();
        setEntries(data);
        setFiltered(data);
      } catch (error) {
        toast.error(getApiError(error), {
          style: {
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAdmin]);

  // Valores únicos para selects
  const tablas = useMemo(
    () => Array.from(new Set(entries.map((e) => e.tabla))).sort(),
    [entries]
  );

  const operaciones = useMemo(
    () => Array.from(new Set(entries.map((e) => e.operacion))).sort(),
    [entries]
  );

  // Filtros en tiempo real
  useEffect(() => {
    let data = [...entries];

    if (tablaFilter) {
      data = data.filter((e) => e.tabla === tablaFilter);
    }

    if (operacionFilter) {
      data = data.filter((e) => e.operacion === operacionFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter((e) => {
        const usuario = e.usuario_id ?? "";
        const newStr = e.new_data ? JSON.stringify(e.new_data).toLowerCase() : "";
        const oldStr = e.old_data ? JSON.stringify(e.old_data).toLowerCase() : "";
        return (
          e.tabla.toLowerCase().includes(term) ||
          e.operacion.toLowerCase().includes(term) ||
          usuario.toLowerCase().includes(term) ||
          newStr.includes(term) ||
          oldStr.includes(term)
        );
      });
    }

    setFiltered(data);
    setCurrentPage(1); // cada vez que cambia el filtro, volvemos a la primera página
  }, [entries, searchTerm, tablaFilter, operacionFilter]);

  // Ajustar currentPage si el número de páginas cambia
  useEffect(() => {
    const maxPage =
      filtered.length === 0 ? 1 : Math.ceil(filtered.length / PAGE_SIZE);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filtered, currentPage]);

  const totalPages =
    filtered.length === 0 ? 1 : Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const getDisplayUser = (entry: BitacoraEntry): string => {
    const nombreFromNew =
      entry.new_data && (entry.new_data as any).usuario_nombre;
    const nombreFromOld =
      entry.old_data && (entry.old_data as any).usuario_nombre;

    return (
      (nombreFromNew as string | undefined) ||
      (nombreFromOld as string | undefined) ||
      entry.usuario_id ||
      "—"
    );
  };

  // Estados de admin
  if (adminLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  // Si NO es admin, no muestra nada
  if (!isAdmin) {
    return null;
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 sm:p-3 rounded-2xl shadow-lg flex-shrink-0">
              <FileSearch className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Bitácora de cambios del sistema
              </h1>
              <p className="text-gray-700 text-xs sm:text-sm lg:text-base">
                Revisa las operaciones realizadas sobre las tablas de la base de
                datos
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar por tabla, operación, usuario o contenido..."
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selects */}
          <div className="flex flex-wrap gap-2">
            <select
              className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={tablaFilter}
              onChange={(e) => setTablaFilter(e.target.value)}
            >
              <option value="">Todas las tablas</option>
              {tablas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={operacionFilter}
              onChange={(e) => setOperacionFilter(e.target.value)}
            >
              <option value="">Todas las operaciones</option>
              {operaciones.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm sm:text-base text-gray-500">
              No se encontraron registros de bitácora con los filtros actuales.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600">
                        Fecha
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600">
                        Tabla
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600">
                        Operación
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-gray-600">
                        Usuario
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-right font-semibold text-gray-600">
                        Detalle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/70">
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-gray-800">
                          {new Date(entry.fecha).toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap font-medium text-gray-900">
                          {entry.tabla}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " +
                              (entry.operacion === "INSERT"
                                ? "bg-emerald-50 text-emerald-700"
                                : entry.operacion === "UPDATE"
                                ? "bg-amber-50 text-amber-700"
                                : entry.operacion === "DELETE"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-50 text-slate-700")
                            }
                          >
                            {entry.operacion}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-gray-700">
                          {getDisplayUser(entry)}
                        </td>
                        <td className="px-3 sm:px-4 py-2 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-gray-600">
                <div>
                  {filtered.length > 0 && (
                    <>
                      Mostrando{" "}
                      {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, filtered.length)} de{" "}
                      {filtered.length} registros
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-full border text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-full border text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedEntry && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                  Detalle de cambio — {selectedEntry.tabla}
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  {new Date(selectedEntry.fecha).toLocaleString()} ·{" "}
                  {selectedEntry.operacion} · Usuario:{" "}
                  {getDisplayUser(selectedEntry)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>

            <div className="p-3 sm:p-4 overflow-auto text-xs sm:text-sm bg-gray-50">
              {selectedEntry.old_data && (
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Datos anteriores (old_data)
                  </h3>
                  <pre className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 overflow-auto text-[11px] sm:text-xs">
                    {JSON.stringify(selectedEntry.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEntry.new_data && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Datos nuevos (new_data)
                  </h3>
                  <pre className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 overflow-auto text-[11px] sm:text-xs">
                    {JSON.stringify(selectedEntry.new_data, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedEntry.old_data && !selectedEntry.new_data && (
                <p className="text-gray-500 text-xs">
                  No hay datos disponibles para este registro.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
