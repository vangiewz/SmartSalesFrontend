// src/pages/ConfigParametrosNegocioPage.tsx
import { useEffect, useState } from "react";
import { Settings, Save, ShieldCheck, LineChart, AlertTriangle, Building2 } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";
import toast from "react-hot-toast";

type ParametrosNegocioForm = {
  nombreEmpresa: string;
  monedaBase: string;
  pais: string;

  umbralStockBajo: number;
  horizontePrediccionMeses: number;
  frecuenciaEntrenamientoDias: number;

  descuentoMaximo: number;
  diasVencimientoFactura: number;
  permiteVentasCredito: boolean;
  alertaVencimientoDias: number;

  habilitarNotificacionesPush: boolean;
  emailAlertas: string;

  ultimoGuardado?: string;
};

const DEFAULT_VALUES: ParametrosNegocioForm = {
  nombreEmpresa: "SmartSales365 S.R.L.",
  monedaBase: "BOB",
  pais: "Bolivia",

  umbralStockBajo: 10,
  horizontePrediccionMeses: 3,
  frecuenciaEntrenamientoDias: 30,

  descuentoMaximo: 15,
  diasVencimientoFactura: 30,
  permiteVentasCredito: true,
  alertaVencimientoDias: 5,

  habilitarNotificacionesPush: true,
  emailAlertas: "alertas@smartsales365.com",

  ultimoGuardado: undefined,
};

export default function ConfigParametrosNegocioPage() {
  // Solo administrador
  const { isAllowed, loading: rolesLoading } = useAllowedRoles(["admin"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ParametrosNegocioForm>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Simula carga inicial desde backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setForm({
        ...DEFAULT_VALUES,
        ultimoGuardado: "07/11/2025 10:32",
      });
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (
    field: keyof ParametrosNegocioForm,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpia error de ese campo al modificar
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nombreEmpresa.trim()) {
      newErrors.nombreEmpresa = "El nombre de la empresa es obligatorio.";
    }
    if (!form.monedaBase.trim()) {
      newErrors.monedaBase = "La moneda base es obligatoria.";
    }
    if (form.umbralStockBajo < 1 || form.umbralStockBajo > 100) {
      newErrors.umbralStockBajo = "El umbral debe estar entre 1% y 100%.";
    }
    if (form.horizontePrediccionMeses < 1 || form.horizontePrediccionMeses > 24) {
      newErrors.horizontePrediccionMeses =
        "El horizonte de predicción debe estar entre 1 y 24 meses.";
    }
    if (form.frecuenciaEntrenamientoDias < 1 || form.frecuenciaEntrenamientoDias > 365) {
      newErrors.frecuenciaEntrenamientoDias =
        "La frecuencia de entrenamiento debe estar entre 1 y 365 días.";
    }
    if (form.descuentoMaximo < 0 || form.descuentoMaximo > 80) {
      newErrors.descuentoMaximo = "El descuento máximo debe estar entre 0% y 80%.";
    }
    if (form.diasVencimientoFactura < 1 || form.diasVencimientoFactura > 180) {
      newErrors.diasVencimientoFactura =
        "Los días de vencimiento deben estar entre 1 y 180.";
    }
    if (form.alertaVencimientoDias < 0 || form.alertaVencimientoDias > form.diasVencimientoFactura) {
      newErrors.alertaVencimientoDias =
        "Los días de alerta no pueden ser mayores al vencimiento.";
    }
    if (!form.emailAlertas.trim()) {
      newErrors.emailAlertas = "El correo para alertas es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAlertas)) {
      newErrors.emailAlertas = "Formato de correo no válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Por favor, corrige los campos marcados antes de guardar.");
      return;
    }

    setSaving(true);

    // Simula llamada al backend
    setTimeout(() => {
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-BO");
      const hora = ahora.toLocaleTimeString("es-BO", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setForm((prev) => ({
        ...prev,
        ultimoGuardado: `${fecha} ${hora}`,
      }));

      setSaving(false);
      toast.success("Parámetros del negocio actualizados correctamente.");
    }, 1200);
  };

  if (rolesLoading || loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!isAllowed) {
    return (
      <ProtectedLayout>
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4">
            <p className="text-sm font-medium text-red-700">
              No tienes permisos para acceder a la configuración de parámetros del negocio.
            </p>
            <p className="mt-1 text-xs text-red-600">
              Solo los usuarios con rol <span className="font-semibold">Administrador</span> pueden
              modificar estos parámetros.
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
                Configurar parámetros del negocio
              </h1>
              <p className="text-sm text-gray-500">
                Ajusta los valores que afectan el comportamiento global del sistema SmartSales365.
              </p>
            </div>
          </div>

          <div className="text-right text-xs md:text-sm text-gray-500">
            <p className="font-medium text-gray-700 flex items-center justify-end gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Acceso: Administrador
            </p>
            {form.ultimoGuardado && (
              <p className="mt-1">
                Última actualización:{" "}
                <span className="font-medium text-gray-700">{form.ultimoGuardado}</span>
              </p>
            )}
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6"
        >
          {/* Sección: Datos de la empresa */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-700" />
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                Datos generales de la empresa
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.nombreEmpresa
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.nombreEmpresa}
                  onChange={(e) => handleChange("nombreEmpresa", e.target.value)}
                  placeholder="Ej: SmartSales365 S.R.L."
                />
                {errors.nombreEmpresa && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.nombreEmpresa}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Moneda base</label>
                <input
                  type="text"
                  className={`w-full text-sm rounded-lg border px-3 py-2 uppercase outline-none transition ${
                    errors.monedaBase
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.monedaBase}
                  onChange={(e) => handleChange("monedaBase", e.target.value.toUpperCase())}
                  placeholder="Ej: BOB, USD, ARS"
                  maxLength={3}
                />
                {errors.monedaBase && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.monedaBase}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">País</label>
                <input
                  type="text"
                  className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                  value={form.pais}
                  onChange={(e) => handleChange("pais", e.target.value)}
                  placeholder="Ej: Bolivia"
                />
              </div>
            </div>
          </section>

          {/* Sección: Inventario y stock */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                Parámetros de stock e inventario
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Umbral de stock bajo (%)
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.umbralStockBajo
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.umbralStockBajo}
                  onChange={(e) =>
                    handleChange("umbralStockBajo", Number(e.target.value) || 0)
                  }
                  min={1}
                  max={100}
                />
                <p className="text-[11px] text-gray-500">
                  Cuando el stock esté por debajo de este porcentaje se generarán alertas.
                </p>
                {errors.umbralStockBajo && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.umbralStockBajo}</p>
                )}
              </div>
            </div>
          </section>

          {/* Sección: IA y predicciones */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                Parámetros de predicción de ventas (IA)
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Horizonte de predicción (meses)
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.horizontePrediccionMeses
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.horizontePrediccionMeses}
                  onChange={(e) =>
                    handleChange("horizontePrediccionMeses", Number(e.target.value) || 0)
                  }
                  min={1}
                  max={24}
                />
                <p className="text-[11px] text-gray-500">
                  Período futuro que utilizará el modelo Random Forest para proyectar ventas.
                </p>
                {errors.horizontePrediccionMeses && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.horizontePrediccionMeses}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Frecuencia de entrenamiento (días)
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.frecuenciaEntrenamientoDias
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.frecuenciaEntrenamientoDias}
                  onChange={(e) =>
                    handleChange("frecuenciaEntrenamientoDias", Number(e.target.value) || 0)
                  }
                  min={1}
                  max={365}
                />
                <p className="text-[11px] text-gray-500">
                  Cada cuántos días se volverá a entrenar el modelo con datos históricos.
                </p>
                {errors.frecuenciaEntrenamientoDias && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.frecuenciaEntrenamientoDias}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sección: Condiciones comerciales */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                Condiciones comerciales y de crédito
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Descuento máximo permitido (%)
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.descuentoMaximo
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.descuentoMaximo}
                  onChange={(e) =>
                    handleChange("descuentoMaximo", Number(e.target.value) || 0)
                  }
                  min={0}
                  max={80}
                />
                <p className="text-[11px] text-gray-500">
                  Límite máximo de descuento que pueden aplicar los vendedores.
                </p>
                {errors.descuentoMaximo && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.descuentoMaximo}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Días de vencimiento de factura
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.diasVencimientoFactura
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.diasVencimientoFactura}
                  onChange={(e) =>
                    handleChange("diasVencimientoFactura", Number(e.target.value) || 0)
                  }
                  min={1}
                  max={180}
                />
                <p className="text-[11px] text-gray-500">
                  Plazo estándar antes de que una factura se considere vencida.
                </p>
                {errors.diasVencimientoFactura && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.diasVencimientoFactura}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Alerta de vencimiento (días antes)
                </label>
                <input
                  type="number"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.alertaVencimientoDias
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.alertaVencimientoDias}
                  onChange={(e) =>
                    handleChange("alertaVencimientoDias", Number(e.target.value) || 0)
                  }
                  min={0}
                  max={form.diasVencimientoFactura || 180}
                />
                <p className="text-[11px] text-gray-500">
                  Días antes del vencimiento en que se disparan recordatorios.
                </p>
                {errors.alertaVencimientoDias && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.alertaVencimientoDias}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Ventas a crédito
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleChange("permiteVentasCredito", true)}
                    className={`flex-1 text-xs md:text-sm rounded-lg border px-3 py-2 transition ${
                      form.permiteVentasCredito
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Permitidas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("permiteVentasCredito", false)}
                    className={`flex-1 text-xs md:text-sm rounded-lg border px-3 py-2 transition ${
                      !form.permiteVentasCredito
                        ? "border-red-500 bg-red-50 text-red-800"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Solo contado
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Controla si el sistema permitirá registrar ventas a crédito.
                </p>
              </div>
            </div>
          </section>

          {/* Sección: Notificaciones y alertas */}
          <section className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-sky-600" />
              <h2 className="text-sm md:text-base font-semibold text-gray-800">
                Notificaciones y alertas
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Notificaciones push
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleChange("habilitarNotificacionesPush", true)}
                    className={`flex-1 text-xs md:text-sm rounded-lg border px-3 py-2 transition ${
                      form.habilitarNotificacionesPush
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Habilitadas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("habilitarNotificacionesPush", false)}
                    className={`flex-1 text-xs md:text-sm rounded-lg border px-3 py-2 transition ${
                      !form.habilitarNotificacionesPush
                        ? "border-gray-500 bg-gray-50 text-gray-800"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Deshabilitadas
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Controla si la app móvil recibirá notificaciones de stock bajo, vencimientos, etc.
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-gray-700">
                  Correo para envío de alertas
                </label>
                <input
                  type="email"
                  className={`w-full text-sm rounded-lg border px-3 py-2 outline-none transition ${
                    errors.emailAlertas
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-100"
                  }`}
                  value={form.emailAlertas}
                  onChange={(e) => handleChange("emailAlertas", e.target.value)}
                  placeholder="Ej: alertas@smartsales365.com"
                />
                {errors.emailAlertas && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.emailAlertas}</p>
                )}
              </div>
            </div>
          </section>

          {/* Pie de formulario */}
          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[11px] md:text-xs text-gray-500">
              Los cambios aplican de forma global a todos los módulos (ventas, reportes,
              dashboard e IA).
            </p>

            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs md:text-sm font-medium text-white shadow-sm transition ${
                saving
                  ? "bg-blue-300 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-200"
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando cambios..." : "Guardar parámetros"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
