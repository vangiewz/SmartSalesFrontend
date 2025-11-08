import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bookmark, Plus, Trash2, Play, X } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  fetchPlantillas,
  createPlantilla,
  deletePlantilla,
  type PlantillaReporte,
} from "../../services/aiReports";

type PlantillasManagerProps = {
  currentPrompt: string;
  onApplyTemplate: (prompt: string) => void;
};

export default function PlantillasManager({
  currentPrompt,
  onApplyTemplate,
}: PlantillasManagerProps) {
  const [plantillas, setPlantillas] = useState<PlantillaReporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);

  // Carga inicial de plantillas
  useEffect(() => {
    loadPlantillas();
  }, []);

  async function loadPlantillas() {
    setLoading(true);
    try {
      const data = await fetchPlantillas();
      // 🔽 ÚNICO CAMBIO:
      setPlantillas(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "No se pudieron cargar las plantillas");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!templateName.trim()) {
      toast.error("Debes ingresar un nombre");
      return;
    }
    if (!currentPrompt.trim()) {
      toast.error("No hay prompt para guardar");
      return;
    }

    setSaving(true);
    try {
      await createPlantilla({
        nombre: templateName.trim(),
        prompt: currentPrompt,
        formato: extractFormat(currentPrompt),
        filtros: null,
      });
      toast.success("Plantilla guardada exitosamente");
      setShowSaveDialog(false);
      setTemplateName("");
      loadPlantillas();
    } catch (e: any) {
      toast.error(e?.message || "Error al guardar la plantilla");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, nombre: string) {
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return;

    try {
      await deletePlantilla(id);
      toast.success("Plantilla eliminada");
      loadPlantillas();
    } catch (e: any) {
      toast.error(e?.message || "Error al eliminar");
    }
  }

  function extractFormat(prompt: string): "pdf" | "xlsx" | "csv" | null {
    const p = String(prompt || "").toLowerCase();
    if (/\bpdf\b/.test(p)) return "pdf";
    if (/\bexcel\b/.test(p) || /\bxlsx\b/.test(p)) return "xlsx";
    if (/\bcsv\b/.test(p)) return "csv";
    return null;
  }

  return (
    <div className="mt-8">
      <style>{`
        .template-card {
          transition: all 0.2s ease-in-out;
        }
        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
        .template-actions button {
          transition: all 0.15s ease-in-out;
        }
        .template-actions button:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Header con botón para guardar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">
            Plantillas guardadas
          </h3>
        </div>
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentPrompt.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm"
          title="Guardar el prompt actual como plantilla"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Guardar plantilla</span>
          <span className="sm:hidden">Guardar</span>
        </button>
      </div>

      {/* Lista de plantillas */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : plantillas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No tienes plantillas guardadas aún.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Escribe un prompt y guárdalo para usarlo después.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((t) => (
            <div
              key={t.id}
              className="template-card bg-white border border-indigo-100 rounded-xl p-4 shadow-sm"
            >
              {/* Nombre y formato */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800 text-sm flex-1 line-clamp-1">
                  {t.nombre}
                </h4>
                {t.formato && (
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                    {t.formato.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Prompt truncado */}
              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                {t.prompt}
              </p>

              {/* Acciones */}
              <div className="template-actions flex items-center gap-2">
                <button
                  onClick={() => onApplyTemplate(t.prompt)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium"
                  title="Aplicar esta plantilla"
                >
                  <Play size={14} />
                  Usar
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.nombre)}
                  className="inline-flex items-center justify-center p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200"
                  title="Eliminar plantilla"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para guardar plantilla */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Guardar plantilla
              </h2>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la plantilla
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ej: Ventas de enero 2025"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt a guardar
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 max-h-24 overflow-y-auto">
                {currentPrompt}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !templateName.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
