// src/pages/HistoricoVentas.tsx
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAllowedRoles } from "../hooks/useAllowedRoles";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
} from "recharts";
import { BarChart3, FileDown } from "lucide-react";

// 👉 valores (runtime)
import { fetchHistorico } from "../services/ventasHistoricas";
// 👉 servicios de predicción
import {
  fetchPrediccionesVentas,
  fetchPrediccionesVentasPorCategoria,
} from "../services/modeloPrediccion";

// 👉 tipos (solo type)
import type {
  GroupBy,
  Granularity,
  Metric,
  Meta,
  PeriodoRow,
  ProductoRow,
  ClienteRow,
} from "../services/ventasHistoricas";
import type {
  PrediccionesVentasResponse,
  PrediccionesVentasPorCategoriaResponse,
} from "../services/modeloPrediccion";

type ModoPrediccion = "total" | "categoria";
type HorizontePreset = 3 | 6 | 9 | 12 | "custom";

const currency = new Intl.NumberFormat("es-BO", {
  style: "currency",
  currency: "BOB",
  maximumFractionDigits: 2,
});
const numberFmt = new Intl.NumberFormat("es-ES");

function formatPeriodLabel(iso: string, granularity: Granularity = "month") {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  switch (granularity) {
    case "day":
      return d.toLocaleDateString("es", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    case "week":
      return d.toLocaleDateString("es", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    case "month":
      return d.toLocaleDateString("es", { year: "numeric", month: "short" });
    case "quarter": {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `T${q} ${d.getFullYear()}`;
    }
    case "year":
      return String(d.getFullYear());
    default:
      return d.toLocaleDateString("es");
  }
}

// Paleta simple para líneas por categoría
const CATEGORY_COLORS = [
  "#4f46e5",
  "#16a34a",
  "#f97316",
  "#0ea5e9",
  "#ec4899",
  "#22c55e",
  "#a855f7",
  "#fbbf24",
];

interface ComparativaRow {
  periodLabel: string;
  historico?: number;
  predicho?: number;
}

interface CategoriaSeriePoint {
  period: string;
  periodLabel: string;
  total_predicho: number;
}

interface CategoriaSerieChart {
  id: number;
  name: string;
  data: CategoriaSeriePoint[];
}

export default function HistoricoVentas() {
  // Acceso: analista y admin
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "analista",
    "admin",
  ]);

  // ------------------- Estado de histórico -------------------
  const [groupBy, setGroupBy] = useState<GroupBy>("periodo");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [metric, setMetric] = useState<Metric>("total");
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);
  const [topN, setTopN] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState<Meta | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  // ------------------- Estado de predicciones -------------------
  const [modoPred, setModoPred] = useState<ModoPrediccion>("total");
  const [horizontePreset, setHorizontePreset] = useState<HorizontePreset>(3);
  const [horizonteCustom, setHorizonteCustom] = useState<number>(3);
  const [showHistoricoForecast, setShowHistoricoForecast] = useState(false);

  const [forecastTotal, setForecastTotal] =
    useState<PrediccionesVentasResponse | null>(null);
  const [forecastCategoria, setForecastCategoria] =
    useState<PrediccionesVentasPorCategoriaResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  // categorías seleccionadas (si está vacío => todas)
  const [selectedCategoriaIds, setSelectedCategoriaIds] = useState<number[]>(
    []
  );

  const horizonteMeses = useMemo(() => {
    const raw =
      horizontePreset === "custom" ? horizonteCustom : horizontePreset;
    const n = Number(raw || 1);
    return Math.min(Math.max(n, 1), 24);
  }, [horizontePreset, horizonteCustom]);

  // ------------------- Carga de histórico -------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { group_by: groupBy };
      if (groupBy === "periodo") params.granularity = granularity;
      if (dateFrom) params.date_from = dateFrom; // YYYY-MM-DD
      if (dateTo) params.date_to = dateTo; // YYYY-MM-DD
      if (groupBy !== "periodo") {
        params.limit = topN;
        params.offset = 0;
      }
      const data = await fetchHistorico(params);
      setMeta(data.meta);
      setRows(data.data || []);
      if ((data.data || []).length === 0) {
        console.warn("[Historico] Respuesta vacía", {
          params,
          meta: data.meta,
        });
      }
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.detail || e?.message || "Error al cargar histórico";
      toast.error(msg);
      setMeta(null);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------- Carga de predicciones -------------------
  const loadForecast = async () => {
    setForecastLoading(true);
    setForecastError(null);
    try {
      if (modoPred === "total") {
        const data = await fetchPrediccionesVentas(horizonteMeses);
        setForecastTotal(data);
        setForecastCategoria(null);
      } else {
        const data = await fetchPrediccionesVentasPorCategoria(horizonteMeses);
        setForecastCategoria(data);
        setForecastTotal(null);
      }
    } catch (err: any) {
      console.error("[HistoricoVentas] Error cargando predicciones:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Error al cargar predicciones de ventas.";
      setForecastError(msg);
      toast.error(msg);
    } finally {
      setForecastLoading(false);
    }
  };

  // Cargar una vez con los valores por defecto
  useEffect(() => {
    loadForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si cambian las predicciones por categoría, reseteamos selección (todas)
  useEffect(() => {
    if (forecastCategoria) {
      setSelectedCategoriaIds([]);
    }
  }, [forecastCategoria]);

  // ------------------- Derivados histórico -------------------
  const periodData = useMemo(() => {
    if (groupBy !== "periodo") return [];
    const g = (meta?.granularity as Granularity) || granularity;
    return (rows as PeriodoRow[]).map((r) => ({
      ...r,
      periodLabel: formatPeriodLabel(r.period, g),
    }));
  }, [rows, groupBy, meta?.granularity, granularity]);

  const barRows = useMemo(() => {
    if (groupBy === "producto") {
      return (rows as ProductoRow[]).map((r) => ({
        ...r,
        ticket_promedio: r.cantidad ? r.total / r.cantidad : 0,
      }));
    }
    if (groupBy === "cliente") {
      return (rows as ClienteRow[]).map((r) => ({
        ...r,
        ticket_promedio: r.cantidad ? r.total / r.cantidad : 0,
      }));
    }
    return [];
  }, [rows, groupBy]);

  const headerTitle = useMemo(() => {
    if (groupBy === "periodo")
      return "Dashboard de ventas históricas y predicciones";
    if (groupBy === "producto") return "Top productos";
    return "Top clientes";
  }, [groupBy]);

  // ------------------- Derivados predicción TOTAL -------------------
  const comparativaTotalData: ComparativaRow[] = useMemo(() => {
    if (!forecastTotal) return [];

    const g: Granularity = "month";

    if (!showHistoricoForecast) {
      // Solo futuros
      return forecastTotal.predicciones.map((p) => ({
        periodLabel: formatPeriodLabel(p.periodo, g),
        predicho: p.total_predicho,
      }));
    }

    // Histórico + futuros
    const map = new Map<string, ComparativaRow>();

    forecastTotal.historico.forEach((h) => {
      const label = formatPeriodLabel(h.periodo, g);
      const entry = map.get(label) || { periodLabel: label };
      entry.historico = h.total_real;
      map.set(label, entry);
    });

    forecastTotal.predicciones.forEach((p) => {
      const label = formatPeriodLabel(p.periodo, g);
      const entry = map.get(label) || { periodLabel: label };
      entry.predicho = p.total_predicho;
      map.set(label, entry);
    });

    return Array.from(map.values());
  }, [forecastTotal, showHistoricoForecast]);

  // ------------------- Derivados predicción por CATEGORÍA -------------------
  const categoriaSeriesChart: CategoriaSerieChart[] = useMemo(() => {
    if (!forecastCategoria) return [];

    const series = (forecastCategoria as any).series;

    if (!Array.isArray(series)) {
      console.warn(
        "[HistoricoVentas] Respuesta inesperada en forecastCategoria",
        forecastCategoria
      );
      return [];
    }

    return series.map((cat: any) => ({
      id: cat.categoria_id,
      name: cat.categoria,
      data: cat.predicciones.map((p: any) => ({
        period: p.periodo,
        periodLabel: formatPeriodLabel(p.periodo, "month"),
        total_predicho: p.total_predicho,
      })),
    }));
  }, [forecastCategoria]);

  // Todas las fechas combinadas (para que el eje X y la tabla usen TODO)
  const categoriaCombinedData = useMemo(() => {
    if (categoriaSeriesChart.length === 0) return [];

    const map = new Map<
      string,
      { period: string; periodLabel: string; [key: string]: any }
    >();

    categoriaSeriesChart.forEach((serie) => {
      serie.data.forEach((p) => {
        const key = p.period;
        let row = map.get(key);
        if (!row) {
          row = { period: p.period, periodLabel: p.periodLabel };
          map.set(key, row);
        }
        row[serie.name] = p.total_predicho;
      });
    });

    const arr = Array.from(map.values());
    arr.sort((a, b) => (a.period < b.period ? -1 : a.period > b.period ? 1 : 0));
    return arr;
  }, [categoriaSeriesChart]);

  // Categorías visibles según selección
  const visibleCategorias = useMemo(() => {
    if (selectedCategoriaIds.length === 0) return categoriaSeriesChart;
    return categoriaSeriesChart.filter((s) =>
      selectedCategoriaIds.includes(s.id)
    );
  }, [categoriaSeriesChart, selectedCategoriaIds]);

  const toggleCategoria = (id: number) => {
    setSelectedCategoriaIds((prev) => {
      if (prev.length === 0) {
        // antes estaban todas, empezamos selección nueva solo con esta
        return [id];
      }
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        return next;
      }
      return [...prev, id];
    });
  };

  const mostrarTodasCategorias = () => {
    setSelectedCategoriaIds([]);
  };

  const getCategoriaColor = (id: number) => {
    const idx = categoriaSeriesChart.findIndex((s) => s.id === id);
    const safeIdx = idx === -1 ? 0 : idx;
    return CATEGORY_COLORS[safeIdx % CATEGORY_COLORS.length];
  };

  // ------------------- Exportar a PDF (via print) -------------------
  const handleExportPdf = () => {
    try {
      window.print();
      toast("Usa la opción 'Guardar como PDF' en el cuadro de impresión.", {
        icon: "🖨️",
      });
    } catch (e) {
      console.error(e);
      toast.error("No se pudo iniciar la impresión. Intenta nuevamente.");
    }
  };

  // ------------------- Render -------------------
  if (rolesLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }
  if (!isAllowed) return null;

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {headerTitle}
            </h1>
            <p className="text-gray-700 text-sm">
              {groupBy === "periodo"
                ? "Analiza ventas históricas y proyecciones futuras por período. Si no eliges fechas, se usa desde la primera venta hasta la última."
                : "Ranking agregado en el rango. Si no eliges fechas, se usa desde la primera venta hasta la última."}
            </p>
          </div>
        </div>

        {/* Filtros histórico */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Agrupar por
              </label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              >
                <option value="periodo">Período</option>
                <option value="producto">Producto</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Granularidad
              </label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={granularity}
                onChange={(e) => setGranularity(e.target.value as Granularity)}
                disabled={groupBy !== "periodo"}
                title={groupBy !== "periodo" ? "Sólo aplica para período" : ""}
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
                <option value="quarter">Trimestre</option>
                <option value="year">Año</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Métrica
              </label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={metric}
                onChange={(e) => setMetric(e.target.value as Metric)}
              >
                <option value="total">Total</option>
                <option value="cantidad">Cantidad</option>
                <option value="ticket_promedio">Ticket promedio</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Desde (opcional)
              </label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md p-2"
                value={dateFrom || ""}
                onChange={(e) => setDateFrom(e.target.value || undefined)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Hasta (opcional)
              </label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md p-2"
                value={dateTo || ""}
                onChange={(e) => setDateTo(e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Top N (producto/cliente)
              </label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border rounded-md p-2"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value || 10))}
                disabled={groupBy === "periodo"}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Cargando…" : "Aplicar filtros"}
            </button>
            <button
              className="px-3 py-2 rounded-md border hover:bg-gray-50 text-sm"
              onClick={() => {
                setDateFrom(undefined);
                setDateTo(undefined);
                toast(
                  "Se quitaron fechas. Usarás el rango desde la primera venta hasta la última.",
                  { icon: "🗓️" }
                );
                setTimeout(loadData, 0);
              }}
              disabled={loading}
            >
              Limpiar fechas
            </button>
          </div>
        </div>

        {/* Contenido histórico */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              {meta?.from || meta?.to
                ? "Sin datos para los filtros seleccionados."
                : "Sin datos en el histórico."}
            </div>
          ) : groupBy === "periodo" ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="h-[320px] sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodLabel" />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(v) =>
                        metric === "total" || metric === "ticket_promedio"
                          ? currency.format(v).replace("BOB ", "Bs ")
                          : numberFmt.format(v)
                      }
                    />
                    <Tooltip
                      formatter={(value: any, _name: string, props: any) => {
                        const key = String(props.dataKey);
                        if (key === "total") {
                          return [
                            currency
                              .format(value as number)
                              .replace("BOB ", "Bs "),
                            "Total (Bs)",
                          ];
                        }
                        if (key === "ticket_promedio") {
                          return [
                            currency
                              .format(value as number)
                              .replace("BOB ", "Bs "),
                            "Ticket promedio (Bs)",
                          ];
                        }
                        if (key === "cantidad") {
                          return [
                            numberFmt.format(value as number),
                            "Cantidad",
                          ];
                        }
                        return [value, key];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="cantidad"
                      name="Cantidad"
                      fill="#60a5fa"
                      opacity={0.55}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey={metric}
                      name={
                        metric === "total"
                          ? "Total (Bs)"
                          : metric === "ticket_promedio"
                          ? "Ticket promedio (Bs)"
                          : "Cantidad"
                      }
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="text-left bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">Período</th>
                      <th className="px-3 py-2 text-right">Total (Bs)</th>
                      <th className="px-3 py-2 text-right">Cantidad</th>
                      <th className="px-3 py-2 text-right">
                        Ticket promedio (Bs)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(rows as PeriodoRow[]).map((r, idx) => {
                      const label = formatPeriodLabel(
                        r.period,
                        (meta?.granularity as Granularity) || granularity
                      );
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{label}</td>
                          <td className="px-3 py-2 text-right">
                            {currency.format(r.total).replace("BOB ", "Bs ")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {numberFmt.format(r.cantidad)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {currency
                              .format(r.ticket_promedio)
                              .replace("BOB ", "Bs ")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <div className="text-sm text-gray-600">
                  Mostrando Top {topN} por{" "}
                  {metric === "total"
                    ? "Total (Bs)"
                    : metric === "cantidad"
                    ? "Cantidad"
                    : "Ticket promedio"}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm ${
                      metric === "total"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMetric("total")}
                  >
                    Total
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm ${
                      metric === "cantidad"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMetric("cantidad")}
                  >
                    Cantidad
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm ${
                      metric === "ticket_promedio"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMetric("ticket_promedio")}
                  >
                    Ticket prom.
                  </button>
                </div>
              </div>

              <div className="h-[340px] sm:h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barRows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={groupBy === "producto" ? "producto" : "cliente"}
                    />
                    <YAxis
                      tickFormatter={(v) =>
                        metric === "total" || metric === "ticket_promedio"
                          ? currency.format(v).replace("BOB ", "Bs ")
                          : numberFmt.format(v)
                      }
                    />
                    <Tooltip
                      formatter={(value: any) => {
                        if (metric === "total") {
                          return [
                            currency
                              .format(value as number)
                              .replace("BOB ", "Bs "),
                            "Total (Bs)",
                          ];
                        }
                        if (metric === "ticket_promedio") {
                          return [
                            currency
                              .format(value as number)
                              .replace("BOB ", "Bs "),
                            "Ticket promedio (Bs)",
                          ];
                        }
                        return [
                          numberFmt.format(value as number),
                          "Cantidad",
                        ];
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Legend />
                    <Bar
                      dataKey={metric}
                      name={
                        metric === "total"
                          ? "Total (Bs)"
                          : metric === "ticket_promedio"
                          ? "Ticket promedio (Bs)"
                          : "Cantidad"
                      }
                      fill="#4f46e5"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead className="text-left bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">
                        {groupBy === "producto" ? "Producto" : "Cliente"}
                      </th>
                      <th className="px-3 py-2 text-right">Total (Bs)</th>
                      <th className="px-3 py-2 text-right">Cantidad</th>
                      <th className="px-3 py-2 text-right">
                        Ticket prom. (estimado)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {barRows.map((r: any, idx) => {
                      const ticket = Number(r.ticket_promedio || 0);
                      return (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">
                            {groupBy === "producto" ? r.producto : r.cliente}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {currency.format(r.total).replace("BOB ", "Bs ")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {numberFmt.format(r.cantidad)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {currency.format(ticket).replace("BOB ", "Bs ")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* --------- Sección de predicciones --------- */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-emerald-900">
                Predicciones de ventas futuras
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Visualiza el total mensual o desagregado por categoría.
                Opcionalmente compara con el histórico.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-300 text-xs sm:text-sm bg-white hover:bg-gray-50"
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* Controles de predicción */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Modo de predicción
              </label>
              <select
                className="mt-1 w-full border rounded-md p-2 text-sm"
                value={modoPred}
                onChange={(e) => setModoPred(e.target.value as ModoPrediccion)}
              >
                <option value="total">Total mensual</option>
                <option value="categoria">Por categoría</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Horizonte (meses)
              </label>
              <div className="mt-1 flex flex-wrap gap-1">
                {[3, 6, 9, 12].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`px-2.5 py-1 rounded-md border text-xs ${
                      horizontePreset === v
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => setHorizontePreset(v)}
                  >
                    {v}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={horizontePreset === "custom" ? horizonteCustom : ""}
                  placeholder="Otro"
                  className="flex-1 min-w-[60px] border rounded-md px-2 py-1 text-xs"
                  onChange={(e) => {
                    setHorizontePreset("custom");
                    setHorizonteCustom(Number(e.target.value || 1));
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Rango permitido: 1–24.
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <input
                id="show_historico_forecast"
                type="checkbox"
                className="h-4 w-4"
                checked={showHistoricoForecast}
                onChange={(e) => setShowHistoricoForecast(e.target.checked)}
                disabled={modoPred !== "total"}
              />
              <label
                htmlFor="show_historico_forecast"
                className="text-xs sm:text-sm text-gray-700"
              >
                Mostrar histórico de ventas
              </label>
            </div>

            <div className="flex sm:justify-end">
              <button
                type="button"
                onClick={loadForecast}
                disabled={forecastLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {forecastLoading ? "Actualizando…" : "Actualizar predicción"}
              </button>
            </div>
          </div>

          {/* Gráfico de predicción */}
          <div className="mt-5">
            {forecastLoading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="lg" />
              </div>
            ) : forecastError ? (
              <div className="text-red-600 text-sm text-center py-6">
                {forecastError}
              </div>
            ) : modoPred === "total" ? (
              !forecastTotal || comparativaTotalData.length === 0 ? (
                <div className="text-gray-500 text-center py-6 text-sm">
                  No hay datos suficientes para mostrar predicciones.
                </div>
              ) : (
                <>
                  <div className="h-[320px] sm:h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={comparativaTotalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="periodLabel" />
                        <YAxis
                          tickFormatter={(v) =>
                            currency.format(v).replace("BOB ", "Bs ")
                          }
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            currency
                              .format(value as number)
                              .replace("BOB ", "Bs "),
                            name,
                          ]}
                        />
                        <Legend />
                        {showHistoricoForecast && (
                          <Bar
                            dataKey="historico"
                            name="Histórico (Bs)"
                            fill="#4f46e5"
                            opacity={0.6}
                          />
                        )}
                        <Line
                          type="monotone"
                          dataKey="predicho"
                          name="Predicción (Bs)"
                          stroke="#16a34a"
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          strokeDasharray={
                            showHistoricoForecast ? "5 4" : undefined
                          }
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-[11px] sm:text-xs lg:text-sm">
                      <thead className="text-left bg-gray-50">
                        <tr>
                          <th className="px-3 py-2">Período</th>
                          {showHistoricoForecast && (
                            <th className="px-3 py-2 text-right">
                              Histórico (Bs)
                            </th>
                          )}
                          <th className="px-3 py-2 text-right">
                            Predicción (Bs)
                          </th>
                          {showHistoricoForecast && (
                            <th className="px-3 py-2 text-right">
                              Diferencia
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {comparativaTotalData.map((row, idx) => {
                          const h = row.historico ?? 0;
                          const p = row.predicho ?? 0;
                          const diff = p - h;
                          return (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2">
                                {row.periodLabel}
                              </td>
                              {showHistoricoForecast && (
                                <td className="px-3 py-2 text-right">
                                  {h
                                    ? currency
                                        .format(h)
                                        .replace("BOB ", "Bs ")
                                    : "-"}
                                </td>
                              )}
                              <td className="px-3 py-2 text-right">
                                {p
                                  ? currency
                                      .format(p)
                                      .replace("BOB ", "Bs ")
                                  : "-"}
                              </td>
                              {showHistoricoForecast && (
                                <td
                                  className={`px-3 py-2 text-right ${
                                    diff > 0
                                      ? "text-emerald-600"
                                      : diff < 0
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {diff
                                    ? currency
                                        .format(diff)
                                        .replace("BOB ", "Bs ")
                                    : "-"}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            ) : // -------- modo = "categoria" --------
            !forecastCategoria || categoriaSeriesChart.length === 0 ? (
              <div className="text-gray-500 text-center py-6 text-sm">
                No hay datos suficientes para mostrar predicciones por
                categoría.
              </div>
            ) : (
              <>
                {/* Filtros de categoría */}
                <div className="mb-3">
                  <p className="text-[11px] sm:text-xs text-gray-600 mb-1">
                    Selecciona las categorías que quieres ver:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={mostrarTodasCategorias}
                      className={`px-3 py-1 rounded-full border text-[11px] sm:text-xs ${
                        selectedCategoriaIds.length === 0
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      Todas
                    </button>
                    {categoriaSeriesChart.map((serie) => {
                      const isActive =
                        selectedCategoriaIds.length === 0 ||
                        selectedCategoriaIds.includes(serie.id);
                      return (
                        <button
                          key={serie.id}
                          type="button"
                          onClick={() => toggleCategoria(serie.id)}
                          className={`px-3 py-1 rounded-full border text-[11px] sm:text-xs ${
                            isActive
                              ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                              : "bg-white hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {serie.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[320px] sm:h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={categoriaCombinedData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodLabel" />
                      <YAxis
                        domain={[0, "dataMax"]}
                        tickFormatter={(v) =>
                          currency.format(v).replace("BOB ", "Bs ")
                        }
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          currency
                            .format(value as number)
                            .replace("BOB ", "Bs "),
                          name,
                        ]}
                      />
                      <Legend />
                      {visibleCategorias.map((serie) => (
                        <Line
                          key={serie.id}
                          type="monotone"
                          dataKey={serie.name}
                          name={serie.name}
                          stroke={getCategoriaColor(serie.id)}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-[11px] sm:text-xs lg:text-sm">
                    <thead className="text-left bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Período</th>
                        {visibleCategorias.map((serie) => (
                          <th
                            key={serie.id}
                            className="px-3 py-2 text-right"
                          >
                            {serie.name} (Bs)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoriaCombinedData.map((row: any) => (
                        <tr key={row.period} className="border-t">
                          <td className="px-3 py-2">{row.periodLabel}</td>
                          {visibleCategorias.map((serie) => {
                            const value = row[serie.name] as
                              | number
                              | undefined;
                            return (
                              <td
                                key={serie.id}
                                className="px-3 py-2 text-right"
                              >
                                {value
                                  ? currency
                                      .format(value)
                                      .replace("BOB ", "Bs ")
                                  : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {(forecastTotal || forecastCategoria) && (
            <div className="mt-3 text-[11px] sm:text-xs text-gray-500 flex flex-wrap gap-2 justify-between">
              <div>
                Horizonte usado: {horizonteMeses}{" "}
                {horizonteMeses === 1 ? "mes" : "meses"}
              </div>
              <div>
                Modo: {modoPred === "total" ? "Total mensual" : "Por categoría"}
              </div>
            </div>
          )}
        </div>

        {meta && (
          <div className="mt-4 text-xs text-gray-500">
            <div>
              Rango usado:{" "}
              {meta.from ? new Date(meta.from).toLocaleString() : "-"} a{" "}
              {meta.to ? new Date(meta.to).toLocaleString() : "-"}
            </div>
            <div>Filas: {numberFmt.format(meta.count)}</div>
            <div>
              Generado: {new Date(meta.generated_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
