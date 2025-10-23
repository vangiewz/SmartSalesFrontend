import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Zap,
} from "lucide-react";

type Props = {
  columns: string[];
  rows: Record<string, any>[];
  meta: { intent: string; start: string; end: string; filters: Record<string, any> };
};

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#ef4444", "#14b8a6", "#f97316", "#a855f7",
];

export default function ResultTable({ columns, rows, meta }: Props) {
  if (!rows.length) {
    return (
      <div className="text-center text-gray-500 py-16 bg-white rounded-2xl shadow">
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">No hay datos para los parámetros seleccionados.</p>
      </div>
    );
  }

  // Detectar columnas numéricas
  const numericColumns = useMemo(() => {
    return columns.filter((col) => typeof rows[0]?.[col] === "number");
  }, [columns, rows]);

  // Detectar columna categórica principal
  const categoryColumn = useMemo(() => {
    return columns.find(
      (col) => !numericColumns.includes(col) && rows[0]?.[col] != null
    );
  }, [columns, rows, numericColumns]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    const results = [];

    if (numericColumns.length > 0) {
      const mainMetric = numericColumns[0];
      const values = rows.map((r) => Number(r[mainMetric]) || 0);
      const total = values.reduce((a, b) => a + b, 0);
      const avg = total / values.length;
      const max = Math.max(...values);

      results.push(
        { label: `Total ${mainMetric}`, value: total, icon: DollarSign, color: "indigo" },
        { label: `Promedio`, value: avg, icon: TrendingUp, color: "purple" },
        { label: `Máximo`, value: max, icon: Zap, color: "pink" }
      );
    }

    results.push({ label: "Registros", value: rows.length, icon: Package, color: "blue" });

    return results;
  }, [rows, numericColumns]);

  // Limitar datos para gráficos (top 10)
  const chartData = useMemo(() => rows.slice(0, 10), [rows]);

  // Decidir tipo de gráfico
  const showPieChart = rows.length <= 10 && numericColumns.length === 1;
  const showLineChart =
    meta.intent.includes("mes") ||
    meta.intent.includes("tiempo") ||
    columns.some((c) => c.toLowerCase().includes("fecha") || c.toLowerCase().includes("mes"));

  return (
    <div className="space-y-6">
      {/* Header con metadatos - Mejorado */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold">Reporte Generado</h2>
        </div>
        <div className="flex flex-wrap gap-4 text-sm bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-semibold">Intent:</span> {meta.intent}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Rango:</span> {meta.start} → {meta.end}
          </div>
          {Object.keys(meta.filters || {}).length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-semibold">Filtros:</span>{" "}
              {Object.entries(meta.filters)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* KPIs - Cards mejoradas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const gradients = {
            indigo: "from-indigo-500 to-indigo-600",
            purple: "from-purple-500 to-purple-600",
            pink: "from-pink-500 to-pink-600",
            blue: "from-blue-500 to-blue-600",
          };

          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-br ${gradients[kpi.color as keyof typeof gradients]} p-3 rounded-xl shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">
                {kpi.label}
              </p>
              <p className="text-3xl font-extrabold text-gray-900">{fmt(kpi.value)}</p>
            </div>
          );
        })}
      </div>

      {/* TABLA PRIMERO - Datos detallados */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            Datos detallados ({rows.length} registros)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-indigo-50 transition-colors duration-200"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {fmt(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ GRÁFICOS ABAJO - MISMO ANCHO QUE LA TABLA (sin grid de 2 columnas) */}
      {numericColumns.length > 0 && categoryColumn && (
        <div className="space-y-6">
          {/* Gráfico principal - ANCHO COMPLETO */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                {showLineChart ? "Evolución temporal" : "Comparativa"}
              </h3>
            </div>
            <div className="px-6 py-6">
              <ResponsiveContainer width="100%" height={320}>
                {showLineChart ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={categoryColumn}
                      stroke="#6b7280"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any) => fmt(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                    {numericColumns.slice(0, 3).map((col, idx) => (
                      <Line
                        key={col}
                        type="monotone"
                        dataKey={col}
                        stroke={COLORS[idx]}
                        strokeWidth={3}
                        dot={{ fill: COLORS[idx], r: 5, strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 7 }}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={categoryColumn}
                      stroke="#6b7280"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: 11, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e5e7eb",
                        borderRadius: 12,
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any) => fmt(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                    {numericColumns.slice(0, 3).map((col, idx) => (
                      <Bar key={col} dataKey={col} fill={COLORS[idx]} radius={[8, 8, 0, 0]} />
                    ))}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de torta - ANCHO COMPLETO (si aplica) */}
          {showPieChart && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <PieIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  Distribución
                </h3>
              </div>
              <div className="px-6 py-6">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey={numericColumns[0]}
                      nameKey={categoryColumn}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={(entry) =>
                        `${entry[categoryColumn]}: ${fmt(entry[numericColumns[0]])}`
                      }
                      labelLine={{ stroke: "#9ca3af", strokeWidth: 1 }}
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => fmt(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function fmt(v: any) {
  if (v == null) return "—";
  if (v === "number")
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(v);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
}