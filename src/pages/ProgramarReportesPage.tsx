import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarClock,
  BarChart3,
  PlayCircle,
  PauseCircle,
  Send,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";

type ReportFormat = "pdf" | "xlsx" | "csv";
type ReportDestino = "panel" | "email";

type ScheduledReport = {
  id: number;
  nombre: string;
  tipo: string;
  formato: ReportFormat;
  frecuencia: string;
  destino: ReportDestino;
  emailDestino?: string;
  proximaEjecucion: string;
  ultimaEjecucion?: string;
  estado: "Activo" | "En pausa";
};

function buildNextExecution(
  intervalo: number,
  unidad: "dias" | "semanas" | "meses",
  hora: string
): string {
  const now = new Date();
  const next = new Date(now);
  if (unidad === "dias") {
    next.setDate(next.getDate() + intervalo);
  } else if (unidad === "semanas") {
    next.setDate(next.getDate() + intervalo * 7);
  } else {
    next.setMonth(next.getMonth() + intervalo);
  }
  const [h, m] = hora.split(":");
  if (h && m) {
    next.setHours(Number(h), Number(m), 0, 0);
  }
  return `${next.toLocaleDateString("es-BO")} ${next.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function ProgramarReportesPage() {
  // mismos roles que ReportesIAPage
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "admin",
    "vendedor",
    "analista",
  ]);

  const [loading, setLoading] = useState(true);

  // formulario
  const [nombre, setNombre] = useState("Reporte de productos");
  const [tipo, setTipo] = useState("Productos – Inventario detallado");
  const [formato, setFormato] = useState<ReportFormat>("pdf");
  const [intervaloValor, setIntervaloValor] = useState<string>("3");
  const [intervaloUnidad, setIntervaloUnidad] = useState<"dias" | "semanas" | "meses">(
    "meses"
  );
  const [horaEjecucion, setHoraEjecucion] = useState("09:00");
  const [destino, setDestino] = useState<ReportDestino>("panel");
  const [emailDestino, setEmailDestino] = useState("reportes@smartsales365.com");
  const [saving, setSaving] = useState(false);

  // lista de reportes programados (simulados)
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [consoleLog, setConsoleLog] = useState<string | null>(null);

  useEffect(() => {
    if (!isAllowed) {
      setLoading(false);
      return;
    }

    // simulamos carga inicial desde backend
    const timer = setTimeout(() => {
      const base: ScheduledReport[] = [
        {
          id: 1,
          nombre: "Ventas mensuales 2025",
          tipo: "Ventas – Resumen por mes",
          formato: "xlsx",
          frecuencia: "Cada 1 mes(es)",
          destino: "email",
          emailDestino: "direccion.comercial@smartsales365.com",
          proximaEjecucion: buildNextExecution(1, "meses", "08:30"),
          ultimaEjecucion: "01/11/2025 08:30",
          estado: "Activo",
        },
        {
          id: 2,
          nombre: "Garantías por estado",
          tipo: "Garantías – Estado y antigüedad",
          formato: "pdf",
          frecuencia: "Cada 7 día(s)",
          destino: "panel",
          proximaEjecucion: buildNextExecution(7, "dias", "18:00"),
          ultimaEjecucion: "02/11/2025 18:01",
          estado: "En pausa",
        },
        {
          id: 3,
          nombre: "Reporte de productos",
          tipo: "Productos – Inventario detallado",
          formato: "pdf",
          frecuencia: "Cada 3 mes(es)",
          destino: "panel",
          proximaEjecucion: buildNextExecution(3, "meses", "09:00"),
          ultimaEjecucion: undefined,
          estado: "Activo",
        },
      ];
      setReports(base);
      setLoading(false);
      setConsoleLog(
        [
          "Inicializando motor de reportes programados...",
          "✓ Conectado a SmartSalesBackend",
          `✓ ${base.length} tareas encontradas en la programación actual`,
        ].join("\n")
      );
    }, 900);

    return () => clearTimeout(timer);
  }, [isAllowed]);

  const handleGuardarProgramacion = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(intervaloValor);

    if (!nombre.trim()) {
      toast.error("Ingresa un nombre para el reporte.");
      return;
    }
    if (!tipo.trim()) {
      toast.error("Selecciona un tipo de reporte.");
      return;
    }
    if (!intervaloValor || Number.isNaN(num) || num <= 0) {
      toast.error("Ingresa un intervalo válido mayor a 0.");
      return;
    }
    if (destino === "email") {
      if (!emailDestino.trim()) {
        toast.error("Debes indicar un correo de destino.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailDestino.trim())) {
        toast.error("El correo de destino no tiene un formato válido.");
        return;
      }
    }

    setSaving(true);
    try {
      const unidadTexto =
        intervaloUnidad === "dias"
          ? "día(s)"
          : intervaloUnidad === "semanas"
          ? "semana(s)"
          : "mes(es)";

      const nuevaTarea: ScheduledReport = {
        id: reports.length ? Math.max(...reports.map((r) => r.id)) + 1 : 1,
        nombre: nombre.trim(),
        tipo: tipo.trim(),
        formato,
        frecuencia: `Cada ${num} ${unidadTexto}`,
        destino,
        emailDestino: destino === "email" ? emailDestino.trim() : undefined,
        proximaEjecucion: buildNextExecution(num, intervaloUnidad, horaEjecucion),
        ultimaEjecucion: undefined,
        estado: "Activo",
      };

      setReports((prev) => [...prev, nuevaTarea]);

      const rutaComando =
        "C:\\Users\\Leonardo\\PycharmProjects\\SmartSalesBackend\\manage.py";

      const nuevoLog = [
        `${rutaComando}> python manage.py programar_reporte "${nuevaTarea.nombre}"`,
        `Detectado tipo: ${nuevaTarea.tipo}`,
        `Formato de salida: ${nuevaTarea.formato.toUpperCase()}`,
        `Frecuencia: ${nuevaTarea.frecuencia}`,
        `Destino: ${
          nuevaTarea.destino === "email"
            ? `Correo (${nuevaTarea.emailDestino})`
            : "Panel de reportes"
        }`,
        "",
        "Registrando tarea en motor de programación...",
        `✓ Tarea creada con ID interno: RPT-${String(nuevaTarea.id).padStart(4, "0")}`,
        `✓ Próxima ejecución: ${nuevaTarea.proximaEjecucion}`,
      ].join("\n");

      setConsoleLog(nuevoLog);
      toast.success(
        `Reporte "${nuevaTarea.nombre}" programado correctamente (${nuevaTarea.frecuencia}).`
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = (id: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: r.estado === "Activo" ? "En pausa" : "Activo",
            }
          : r
      )
    );

    const rpt = reports.find((r) => r.id === id);
    if (!rpt) return;

    const nuevoEstado = rpt.estado === "Activo" ? "En pausa" : "Activo";
    const rutaComando =
      "C:\\Users\\Leonardo\\PycharmProjects\\SmartSalesBackend\\manage.py";

    setConsoleLog(
      [
        `${rutaComando}> python manage.py actualizar_estado_reporte "${rpt.nombre}"`,
        `Estado anterior: ${rpt.estado}`,
        `Nuevo estado: ${nuevoEstado}`,
        "",
        "✓ Programación actualizada exitosamente.",
      ].join("\n")
    );
    toast.success(
      `Reporte "${rpt.nombre}" ahora está ${nuevoEstado === "Activo" ? "activo" : "en pausa"}.`
    );
  };

  const ejecutarAhora = (id: number) => {
    const rpt = reports.find((r) => r.id === id);
    if (!rpt) return;

    const ahora = new Date();
    const fechaStr = `${ahora.toLocaleDateString("es-BO")} ${ahora.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ultimaEjecucion: fechaStr,
            }
          : r
      )
    );

    const rutaComando =
      "C:\\Users\\Leonardo\\PycharmProjects\\SmartSalesBackend\\manage.py";

    const log = [
      `${rutaComando}> python manage.py ejecutar_reporte_now "${rpt.nombre}"`,
      `Formato: ${rpt.formato.toUpperCase()}`,
      `Destino: ${
        rpt.destino === "email"
          ? `Correo (${rpt.emailDestino})`
          : "Panel de reportes"
      }`,
      "",
      "Procesando dataset...",
      "Generando archivo...",
      `✓ Reporte ejecutado correctamente en ${fechaStr}`,
      `✓ Archivo generado: reports/${rpt.nombre
        .toLowerCase()
        .replace(/\s+/g, "_")}_${ahora.getFullYear()}${String(
        ahora.getMonth() + 1
      ).padStart(2, "0")}${String(ahora.getDate()).padStart(
        2,
        "0"
      )}.${rpt.formato}`,
    ].join("\n");

    setConsoleLog(log);
    toast.success(`Reporte "${rpt.nombre}" ejecutado correctamente.`);
  };

  // gate de acceso
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
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-yellow-800 font-semibold mb-2">
              ⚠️ No tienes permisos para programar reportes automáticos
            </p>
            <p className="text-yellow-700 text-sm">
              Esta sección está reservada para usuarios con rol Administrador, Vendedor o
              Analista.
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <style>{`
        .cron-console {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 11px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <CalendarClock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Programar reportes automáticos
            </h1>
            <p className="text-gray-700 text-sm">
              Define cada cuánto tiempo el sistema debe generar y entregar reportes
              recurrentes.
            </p>
          </div>
        </div>

        {/* Layout principal: formulario + consola */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Formulario */}
          <form
            onSubmit={handleGuardarProgramacion}
            className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-800">
                Nueva tarea de reporte programado
              </h2>
            </div>

            {/* Nombre y tipo */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nombre de la tarea
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2 text-sm"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Reporte de productos cada trimestre"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tipo de reporte
                </label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="Productos – Inventario detallado">
                    Productos – Inventario detallado
                  </option>
                  <option value="Productos – Top productos más vendidos">
                    Productos – Top productos más vendidos
                  </option>
                  <option value="Ventas – Resumen por mes">Ventas – Resumen por mes</option>
                  <option value="Ventas – Por cliente">Ventas – Por cliente</option>
                  <option value="Garantías – Estado y antigüedad">
                    Garantías – Estado y antigüedad
                  </option>
                </select>
              </div>
            </div>

            {/* Frecuencia */}
            <div className="space-y-2 mt-2">
              <label className="block text-xs font-semibold text-gray-600">
                Frecuencia de ejecución
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-600">Ejecutar cada</span>
                <input
                  type="number"
                  min={1}
                  className="w-20 border rounded-md p-1.5 text-xs"
                  value={intervaloValor}
                  onChange={(e) => setIntervaloValor(e.target.value)}
                />
                <select
                  className="border rounded-md p-1.5 text-xs"
                  value={intervaloUnidad}
                  onChange={(e) =>
                    setIntervaloUnidad(e.target.value as "dias" | "semanas" | "meses")
                  }
                >
                  <option value="dias">día(s)</option>
                  <option value="semanas">semana(s)</option>
                  <option value="meses">mes(es)</option>
                </select>

                <span className="text-xs text-gray-600 ml-2">a las</span>
                <input
                  type="time"
                  className="border rounded-md p-1.5 text-xs"
                  value={horaEjecucion}
                  onChange={(e) => setHoraEjecucion(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Ejemplo: <strong>Reporte de productos cada 3 meses</strong> a las 09:00 para
                la gerencia comercial.
              </p>
            </div>

            {/* Formato */}
            <div className="mt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Formato de salida
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormato("pdf")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${
                    formato === "pdf"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => setFormato("xlsx")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${
                    formato === "xlsx"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => setFormato("csv")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${
                    formato === "csv"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>

            {/* Destino */}
            <div className="mt-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Entrega del reporte
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDestino("panel")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${
                    destino === "panel"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Panel de reportes
                </button>
                <button
                  type="button"
                  onClick={() => setDestino("email")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs ${
                    destino === "email"
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Enviar por correo
                </button>
              </div>

              {destino === "email" && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Correo de destino
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-md p-2 text-sm"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                    placeholder="Ej: gerencia.comercial@empresa.com"
                  />
                </div>
              )}
            </div>

            {/* Botón guardar */}
            <div className="pt-3 mt-1 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando programación…" : "Guardar programación"}
              </button>
            </div>
          </form>

          {/* Consola simulada */}
          <div className="bg-black rounded-2xl p-4 sm:p-5 shadow-inner border border-gray-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-300 font-semibold">
                Motor de tareas – SmartSalesBackend
              </span>
              <span className="text-[10px] text-emerald-400">
                STATUS: <span className="font-semibold">RUNNING</span>
              </span>
            </div>
            <div className="cron-console text-emerald-300 bg-black/80 rounded-xl p-3 border border-gray-700 flex-1 overflow-auto">
              {consoleLog || "Inicializando consola de programación de reportes..."}
            </div>
            <p className="mt-2 text-[10px] text-gray-400">

            </p>
          </div>
        </div>

        {/* Tabla de reportes programados */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-indigo-600" />
            Reportes programados
          </h2>

          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aún no hay reportes programados. Crea una nueva tarea con el formulario de la
              izquierda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left hidden sm:table-cell">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-left">Frecuencia</th>
                    <th className="px-3 py-2 text-left hidden md:table-cell">
                      Formato
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Entrega
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Próxima ejecución
                    </th>
                    <th className="px-3 py-2 text-left hidden lg:table-cell">
                      Última ejecución
                    </th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/80">
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{r.nombre}</span>
                          <span className="text-[11px] text-gray-500 sm:hidden">
                            {r.tipo}
                          </span>
                          <span className="text-[10px] text-gray-400 lg:hidden">
                            Próx: {r.proximaEjecucion}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">
                        {r.tipo}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{r.frecuencia}</td>
                      <td className="px-3 py-2 text-gray-700 hidden md:table-cell">
                        {r.formato.toUpperCase()}
                      </td>
                      <td className="px-3 py-2 text-gray-700 hidden lg:table-cell">
                        {r.destino === "email"
                          ? `Correo (${r.emailDestino})`
                          : "Panel de reportes"}
                      </td>
                      <td className="px-3 py-2 text-gray-700 hidden lg:table-cell">
                        {r.proximaEjecucion}
                      </td>
                      <td className="px-3 py-2 text-gray-500 hidden lg:table-cell">
                        {r.ultimaEjecucion || "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => ejecutarAhora(r.id)}
                            className="inline-flex items-center justify-center px-2 py-1 rounded-md border border-emerald-500 text-emerald-700 text-[11px] sm:text-xs hover:bg-emerald-50"
                          >
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Ejecutar
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleEstado(r.id)}
                            className={`inline-flex items-center justify-center px-2 py-1 rounded-md border text-[11px] sm:text-xs ${
                              r.estado === "Activo"
                                ? "border-amber-500 text-amber-700 hover:bg-amber-50"
                                : "border-gray-400 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {r.estado === "Activo" ? (
                              <>
                                <PauseCircle className="w-3 h-3 mr-1" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3 h-3 mr-1" />
                                Reanudar
                              </>
                            )}
                          </button>
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">
                          Estado:{" "}
                          <span
                            className={
                              r.estado === "Activo"
                                ? "text-emerald-600 font-semibold"
                                : "text-gray-500"
                            }
                          >
                            {r.estado}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
