// src/pages/ReportesIA.tsx
import "../lib/client"; // ✅ asegura que el client (baseURL, interceptors) esté inicializado

import { useState } from "react";
import toast from "react-hot-toast";
import { BarChart3 } from "lucide-react";
import ProtectedLayout from "../components/ProtectedLayout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAdminCheck } from "../hooks/useAdminCheck";

import { runAIReport, downloadAIReportBlob, type AIReportResponse } from "../services/aiReports";
import PromptBar from "../components/reports/PromptBar";
import ResultTable from "../components/reports/ResultTable";
import { exportPdf, buildFilename } from "../utils/reportPdf";

export default function ReportesIAPage() {
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReportResponse|null>(null);
  const [lastPrompt, setLastPrompt] = useState("");

  const handleRun = async (prompt: string) => {
    setLoading(true);
    try {
      const data = await runAIReport(prompt);
      setReport(data);
      setLastPrompt(prompt);
    } catch (e:any) {
      toast.error(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: "csv"|"xlsx"|"pdf") => {
    if (!lastPrompt) {
      toast.error("Primero genera un reporte.");
      return;
    }
    try {
      if (format === "pdf") {
        const data = report ?? await runAIReport(lastPrompt);
        if (!report) setReport(data);
        exportPdf(data);
        return;
      }
      const blob = await downloadAIReportBlob(lastPrompt, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = buildFilename(report, format);
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Descargado ${format.toUpperCase()}`);
    } catch (e:any) {
      toast.error(e.message || "Error");
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
              <p className="text-gray-700 text-sm">Genera reportes por prompt y descárgalos en Excel / PDF</p>
            </div>
          </div>
        </div>

        {/* Prompt */}
        <PromptBar loading={loading} onRun={handleRun} onDownload={handleDownload} />

        {/* Resultados */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : report ? (
            <ResultTable
              columns={report.columns}
              rows={report.rows}
              meta={{ intent: report.intent, start: report.start, end: report.end, filters: report.filters }}
            />
          ) : (
            <div className="text-gray-500 text-center py-10">Genera un reporte para ver resultados…</div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
