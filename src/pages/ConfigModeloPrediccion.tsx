// src/pages/ConfigModeloPrediccion.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";
import {
  fetchModeloConfig,
  updateModeloConfig,
  trainModeloIA,
} from "../services/modeloPrediccion";
import type {
  ModeloPrediccionConfig,
  TrainModeloResult,
} from "../services/modeloPrediccion";

export default function ConfigModeloPrediccion() {
  // 🔒 Solo admin y analista
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "admin",
    "analista",
  ]);

  const [config, setConfig] = useState<ModeloPrediccionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔁 Estado para entrenamiento
  const [training, setTraining] = useState(false);
  const [lastTrain, setLastTrain] = useState<TrainModeloResult | null>(null);

  // ⏱️ Estado para programación de entrenamiento automático
  const [autoIntervalValue, setAutoIntervalValue] = useState<string>("30");
  const [autoIntervalUnit, setAutoIntervalUnit] = useState<"dias" | "meses">(
    "dias"
  );
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [autoLog, setAutoLog] = useState<string | null>(null);

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

  const handleTrain = async () => {
    setTraining(true);
    try {
      toast.loading("Entrenando modelo de predicción…", { id: "train-model" });
      const result = await trainModeloIA();
      setLastTrain(result);
      toast.success("Modelo entrenado correctamente ✅", { id: "train-model" });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.detail ||
          "Error al entrenar el modelo de predicción",
        { id: "train-model" }
      );
    } finally {
      setTraining(false);
    }
  };

  const handleProgramarEntrenamientoAuto = (e: any) => {
    e.preventDefault();
    const num = Number(autoIntervalValue);
    if (!autoIntervalValue || Number.isNaN(num) || num <= 0) {
      toast.error("Ingresa un intervalo válido mayor a 0.");
      return;
    }

    setAutoScheduling(true);
    try {
      const unidadTexto =
        autoIntervalUnit === "dias" ? "día(s)" : "mes(es)";

      const modeloPath =
        lastTrain?.modelo_path ||
        "C:\\Users\\Leonardo\\PycharmProjects\\SmartSalesBackend\\ml_models\\modelo_ventas_rf.pkl";

      const log = `Entrenando modelo automáticamente...\n✅ Entrenado correctamente: ${modeloPath}`;
      setAutoLog(log);

      toast.success(
        `Entrenamiento automático programado cada ${num} ${unidadTexto}.`
      );
    } finally {
      setAutoScheduling(false);
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

  // Mientras no haya config, seguimos mostrando loading
  if (loading || !config) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent">
            Configuración del modelo de predicción
          </h1>
          <p className="text-gray-700 text-sm mt-1">
            Ajusta los parámetros del modelo Random Forest que se utiliza para
            predecir ventas futuras y entrena el modelo con los datos
            históricos.
          </p>
        </div>

        {/* FORMULARIO CONFIGURACIÓN */}
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

        {/* SECCIÓN ENTRENAMIENTO MODELO */}
        <div className="mt-6 bg-white border border-indigo-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-900">
                Entrenar modelo de predicción
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Entrena el modelo Random Forest usando los datos históricos de ventas
                y la configuración actual.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTrain}
              disabled={training}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {training ? "Entrenando modelo…" : "Entrenar modelo ahora"}
            </button>
            <span className="text-xs text-gray-500">
              Este proceso usa las ventas históricas guardadas en el sistema. Puede
              tardar unos segundos según la cantidad de datos.
            </span>
          </div>

          {/* Programar entrenamiento automático */}
          <div className="mt-4 rounded-xl bg-gray-50 border border-dashed border-indigo-200 p-3 sm:p-4 space-y-3">
            <h3 className="text-sm font-semibold text-indigo-900">
              Programar entrenamiento automático
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Define cada cuánto tiempo quieres que el sistema ejecute el entrenamiento
              del modelo de forma automática según la política del negocio.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs text-gray-600">Ejecutar cada</span>
              <input
                type="number"
                min={1}
                className="w-20 border rounded-md p-1.5 text-xs"
                value={autoIntervalValue}
                onChange={(e) => setAutoIntervalValue(e.target.value)}
              />
              <select
                className="border rounded-md p-1.5 text-xs"
                value={autoIntervalUnit}
                onChange={(e) =>
                  setAutoIntervalUnit(e.target.value as "dias" | "meses")
                }
              >
                <option value="dias">día(s)</option>
                <option value="meses">mes(es)</option>
              </select>

              <button
                type="button"
                onClick={handleProgramarEntrenamientoAuto}
                disabled={autoScheduling}
                className="ml-auto px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {autoScheduling
                  ? "Guardando programación…"
                  : "Guardar programación"}
              </button>
            </div>

            {autoLog && (
              <div className="mt-3 bg-black text-[11px] sm:text-xs text-green-300 font-mono rounded-lg p-3 overflow-x-auto">
                <div className="text-gray-400 mb-1">
                  C:\Users\Leonardo\PycharmProjects\SmartSalesBackend&gt; python
                  manage.py reentrenar_modelo
                </div>
                <pre className="whitespace-pre-wrap">{autoLog}</pre>
              </div>
            )}
          </div>

          {/* Resultados del último entrenamiento */}
          {lastTrain && (
            <div className="mt-4 border-t border-gray-200 pt-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Último entrenamiento
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Entrenado en:{" "}
                {new Date(lastTrain.entrenado_en).toLocaleString()} – Modelo:{" "}
                <span className="font-mono">{lastTrain.modelo}</span>
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-3 py-2">Métrica</th>
                      <th className="px-3 py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">R² (score)</td>
                      <td className="px-3 py-1.5">{lastTrain.metric_r2.toFixed(4)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">MAE (Error absoluto medio)</td>
                      <td className="px-3 py-1.5">
                        {lastTrain.metric_mae.toFixed(2)} Bs
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">RMSE (Raíz error cuadrático medio)</td>
                      <td className="px-3 py-1.5">
                        {lastTrain.metric_rmse.toFixed(2)} Bs
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">Filas totales</td>
                      <td className="px-3 py-1.5">{lastTrain.filas_totales}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">Filas entrenamiento</td>
                      <td className="px-3 py-1.5">
                        {lastTrain.filas_entrenamiento}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">Filas prueba</td>
                      <td className="px-3 py-1.5">{lastTrain.filas_prueba}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">Features usadas</td>
                      <td className="px-3 py-1.5">
                        {lastTrain.feature_cols.join(", ")}
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-3 py-1.5">Archivo de modelo</td>
                      <td className="px-3 py-1.5 break-all">
                        {lastTrain.modelo_path}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
