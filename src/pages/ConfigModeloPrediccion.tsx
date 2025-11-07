// src/pages/ConfigModeloPrediccion.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";
import {
  fetchModeloConfig,
  updateModeloConfig,
} from "../services/modeloPrediccion";
import type { ModeloPrediccionConfig } from "../services/modeloPrediccion";

export default function ConfigModeloPrediccion() {
  // 🔒 Solo admin y analista
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "admin",
    "analista",
  ]);

  const [config, setConfig] = useState<ModeloPrediccionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAllowed) {
      // si no tiene permisos, no intentes cargar la config
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await fetchModeloConfig();
        setConfig(data);
      } catch (err: any) {
        console.error(err);
        toast.error(
          err?.response?.data?.detail ||
            "Error al cargar configuración del modelo"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAllowed]);

  const handleChangeNumber = (
    field:
      | "horizonte_meses"
      | "n_estimators"
      | "max_depth"
      | "min_samples_split"
      | "min_samples_leaf",
    value: string
  ) => {
    if (!config) return;
    const num = value === "" ? null : Number(value);
    setConfig({
      ...config,
      [field]: num,
    } as ModeloPrediccionConfig);
  };

  const handleChangeBool = (
    field: "incluir_categoria" | "incluir_cliente",
    value: boolean
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    if (
      config.horizonte_meses < 1 ||
      config.horizonte_meses > 24 ||
      config.n_estimators < 10 ||
      config.n_estimators > 500
    ) {
      toast.error(
        "Revisa los rangos: horizonte 1-24 meses, n_estimators 10-500."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        horizonte_meses: config.horizonte_meses,
        n_estimators: config.n_estimators,
        max_depth: config.max_depth,
        min_samples_split: config.min_samples_split,
        min_samples_leaf: config.min_samples_leaf,
        incluir_categoria: config.incluir_categoria,
        incluir_cliente: config.incluir_cliente,
      };
      const updated = await updateModeloConfig(payload);
      setConfig(updated);
      toast.success("Configuración de modelo actualizada.");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.detail ||
          "Error al guardar la configuración del modelo"
      );
    } finally {
      setSaving(false);
    }
  };

  // ⏳ Cargando roles
  if (rolesLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  // 🚫 No tiene permisos (ni admin ni analista)
  if (!isAllowed) {
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes permisos para configurar el modelo de predicción
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

  // Cargando config del modelo
  if (loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!config) {
    return (
      <ProtectedLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-center text-red-600">
            No se pudo cargar la configuración del modelo.
          </p>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            Configuración del modelo de predicción
          </h1>
          <p className="text-gray-700 text-sm mt-1">
            Ajusta los parámetros del modelo Random Forest que se utiliza para
            predecir ventas futuras.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
        >
          {/* Horizonte */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Horizonte de predicción (meses)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              className="w-full border rounded-md p-2 text-sm"
              value={config.horizonte_meses}
              onChange={(e) =>
                handleChangeNumber("horizonte_meses", e.target.value)
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Número de meses hacia el futuro que el modelo intentará predecir
              (1 a 24).
            </p>
          </div>

          {/* n_estimators y max_depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Número de árboles (n_estimators)
              </label>
              <input
                type="number"
                min={10}
                max={500}
                className="w-full border rounded-md p-2 text-sm"
                value={config.n_estimators}
                onChange={(e) =>
                  handleChangeNumber("n_estimators", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Más árboles suelen mejorar la precisión pero aumentan el tiempo
                de entrenamiento.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Profundidad máxima (max_depth)
              </label>
              <input
                type="number"
                min={2}
                max={50}
                className="w-full border rounded-md p-2 text-sm"
                value={config.max_depth ?? ""}
                onChange={(e) =>
                  handleChangeNumber("max_depth", e.target.value)
                }
                placeholder="Vacío = sin límite"
              />
              <p className="text-xs text-gray-500 mt-1">
                Déjalo vacío para que los árboles crezcan libremente.
              </p>
            </div>
          </div>

          {/* min_samples_split / min_samples_leaf */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                min_samples_split
              </label>
              <input
                type="number"
                min={2}
                max={50}
                className="w-full border rounded-md p-2 text-sm"
                value={config.min_samples_split}
                onChange={(e) =>
                  handleChangeNumber("min_samples_split", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de muestras para dividir un nodo interno.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                min_samples_leaf
              </label>
              <input
                type="number"
                min={1}
                max={50}
                className="w-full border rounded-md p-2 text-sm"
                value={config.min_samples_leaf}
                onChange={(e) =>
                  handleChangeNumber("min_samples_leaf", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de muestras en cada hoja del árbol.
              </p>
            </div>
          </div>

          {/* Features a incluir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input
                id="incluir_categoria"
                type="checkbox"
                className="h-4 w-4"
                checked={config.incluir_categoria}
                onChange={(e) =>
                  handleChangeBool("incluir_categoria", e.target.checked)
                }
              />
              <label
                htmlFor="incluir_categoria"
                className="text-sm text-gray-700"
              >
                Incluir categoría de producto como variable
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="incluir_cliente"
                type="checkbox"
                className="h-4 w-4"
                checked={config.incluir_cliente}
                onChange={(e) =>
                  handleChangeBool("incluir_cliente", e.target.checked)
                }
              />
              <label
                htmlFor="incluir_cliente"
                className="text-sm text-gray-700"
              >
                Incluir cliente como variable
              </label>
            </div>
          </div>

          {/* Info de última actualización */}
          <div className="text-xs text-gray-500 border-t pt-3 mt-2">
            <div>
              Modelo: <span className="font-mono">{config.nombre_modelo}</span>
            </div>
            <div>
              Última actualización:{" "}
              {new Date(config.actualizado_en).toLocaleString()}
            </div>
          </div>

          {/* Botón guardar */}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
