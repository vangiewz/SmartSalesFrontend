import "../lib/client"; // ✅ inicializa baseURL e interceptores

import { useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, Sparkles } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAdminCheck } from "../hooks/useAdminCheck";

import {
  runAIReport,
  downloadAIReportBlob,
  type AIReportResponse,
} from "../services/aiReports";
import PromptBar from "../components/reports/PromptBar";
import ResultTable from "../components/reports/ResultTable";
import { exportPdf, exportExcel, buildFilename } from "../utils/reportPdf";

// Detecta formato solicitado en el prompt
function extractFormatFromPrompt(prompt: string): "pdf" | "xlsx" | "csv" | null {
  const p = String(prompt || "").toLowerCase();
  if (/\bpdf\b/.test(p)) return "pdf";
  if (/\bexcel\b/.test(p) || /\bxlsx\b/.test(p)) return "xlsx";
  if (/\bcsv\b/.test(p)) return "csv";
  return null;
}

export default function ReportesIAPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReportResponse | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [promptValue, setPromptValue] = useState("");

  // Palabras clave / ejemplos de uso
  const examples = [
    { text: "ventas detalladas realizadas en enero y febrero 2025", tag: "📊 Detalle completo" },
    { text: "ventas por marca en 2025", tag: "🏷️ Marca" },
    { text: "ventas por categoría en marzo 2025", tag: "📦 Categoría" },
    { text: "ventas por cliente en el primer trimestre 2025", tag: "👤 Cliente" },
    { text: "ventas por mes durante 2025", tag: "📅 Mensual" },
    { text: "top productos más vendidos en 2025", tag: "🔥 Top productos" },
    { text: "ticket promedio del último trimestre", tag: "💰 Ticket promedio" },
    { text: "garantías por estado en 2025", tag: "🧾 Garantías" },
    { text: "ventas de producto 'iPhone' entre enero y marzo 2025", tag: "🔍 Filtro producto" },
  ];

  // DESCARGA AUTOMÁTICA si el prompt lo pide
  const handleRun = async (prompt: string) => {
    setLoading(true);
    try {
      const data = await runAIReport(prompt);
      setReport(data);
      setLastPrompt(prompt);

      // Detecta formato solicitado y descarga automático
      const desiredFormat = extractFormatFromPrompt(prompt);
      if (desiredFormat === "pdf") {
        exportPdf(data);
        toast.success("PDF descargado");
      }
      if (desiredFormat === "xlsx") {
        exportExcel(data);
        toast.success("Excel descargado");
      }
      // (CSV: solo descarga manual en botón, para no confundir al usuario)
    } catch (e: any) {
      toast.error(e?.message || "Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: "csv" | "xlsx" | "pdf") => {
    if (!lastPrompt) {
      toast.error("Primero genera un reporte.");
      return;
    }

    try {
      if (format === "pdf") {
        const data = report ?? (await runAIReport(lastPrompt));
        if (!report) setReport(data);
        exportPdf(data);
        return;
      }

      if (format === "xlsx") {
        const data = report ?? (await runAIReport(lastPrompt));
        if (!report) setReport(data);
        exportExcel(data);
        toast.success("Descargado XLSX");
        return;
      }

      const blob = await downloadAIReportBlob(lastPrompt, "csv");
      const nameData: { intent?: string; start?: string; end?: string } = {
        intent: report?.intent ?? lastPrompt,
        start: report?.start ?? "",
        end: report?.end ?? "",
      };
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildFilename(nameData as any, "csv");
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Descargado CSV");
    } catch (e: any) {
      toast.error(e?.message || "Error al descargar");
    }
  };

  if (adminLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <ProtectedLayout>
      <style>{`
        .report-actions button,
        .report-actions a {
          cursor: pointer !important;
        }
        .keyword-chip {
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
        }
        .keyword-chip:hover {
          background-color: rgba(99,102,241,0.15);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Reportes con IA
              </h1>
              <p className="text-gray-700 text-sm">
                Genera reportes por prompt y descárgalos en Excel / PDF
              </p>
            </div>
          </div>
        </div>

        {/* Prompt + Acciones */}
        <div className="report-actions">
          <PromptBar
            loading={loading}
            onRun={handleRun}
            onDownload={handleDownload}
            value={promptValue}
            onChange={setPromptValue}
          />
        </div>

        {/* Palabras clave / ejemplos */}
        <div className="mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-700 text-sm uppercase tracking-wide">
              Ejemplos y palabras clave
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">
            Prueba con frases naturales o combina filtros por producto, marca, cliente o fechas:
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <span
                key={ex.text}
                onClick={() => setPromptValue(ex.text)}
                className="keyword-chip inline-flex items-center px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs rounded-full shadow-sm hover:shadow-md"
              >
                {ex.tag}
              </span>
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : report ? (
            <ResultTable
              columns={report.columns}
              rows={report.rows}
              meta={{
                intent: report.intent ?? "",
                start: report.start ?? "",
                end: report.end ?? "",
                filters: report.filters ?? {},
              }}
            />
          ) : (
            <div className="text-gray-500 text-center py-10">
              Genera un reporte para ver resultados…
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}