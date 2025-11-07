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
import { BarChart3 } from "lucide-react";

// 👉 valores (runtime)
import { fetchHistorico } from "../services/ventasHistoricas";
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

export default function HistoricoVentas() {
  // Acceso: analista y admin
  const { isAllowed, loading: rolesLoading } = useAllowedRoles([
    "analista",
    "admin",
  ]);

  const [groupBy, setGroupBy] = useState<GroupBy>("periodo");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [metric, setMetric] = useState<Metric>("total");
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);
  const [topN, setTopN] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const [meta, setMeta] = useState<Meta | null>(null);
  const [rows, setRows] = useState<any[]>([]);

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

  // Cargar al montar (sin fechas => backend usa MIN/MAX reales)
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodData = useMemo(() => {
    if (groupBy !== "periodo") return [];
    const g = (meta?.granularity as Granularity) || granularity;
    return (rows as PeriodoRow[]).map((r) => ({
      ...r,
      periodLabel: formatPeriodLabel(r.period, g),
    }));
  }, [rows, groupBy, meta?.granularity, granularity]);

  // Agregamos ticket_promedio calculado para producto/cliente
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
    if (groupBy === "periodo") return "Ventas históricas por período";
    if (groupBy === "producto") return "Top productos";
    return "Top clientes";
  }, [groupBy]);

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
                ? "Se muestran solo períodos con datos. Si no eliges fechas, se usa desde la primera venta hasta la última."
                : "Ranking agregado en el rango. Si no eliges fechas, se usa desde la primera venta hasta la última."}
            </p>
          </div>
        </div>

        {/* Filtros */}
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

          <div className="mt-4 flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Cargando…" : "Aplicar filtros"}
            </button>
            <button
              className="px-3 py-2 rounded-md border hover:bg-gray-50"
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

        {/* Contenido */}
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
              <div className="h-[380px]">
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
                <table className="min-w-full text-sm">
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
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm text-gray-600">
                  Mostrando Top {topN} por{" "}
                  {metric === "total"
                    ? "Total (Bs)"
                    : metric === "cantidad"
                    ? "Cantidad"
                    : "Ticket promedio"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-3 py-1.5 rounded-md border ${
                      metric === "total"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMetric("total")}
                  >
                    Total
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md border ${
                      metric === "cantidad"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setMetric("cantidad")}
                  >
                    Cantidad
                  </button>
                  <button
                    className={`px-3 py-1.5 rounded-md border ${
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

              <div className="h-[420px]">
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
                <table className="min-w-full text-sm">
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
