import "../lib/client"; // ✅ inicializa baseURL e interceptores

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BarChart3, Sparkles, Mic, Square } from "lucide-react";
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

// Tipos mínimos para la Web Speech API (evita errores de TS sin instalar nada extra)
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

// Detecta formato solicitado en el prompt
function extractFormatFromPrompt(prompt: string): "pdf" | "xlsx" | "csv" | null {
  const p = String(prompt || "").toLowerCase();
  if (/\bpdf\b/.test(p)) return "pdf";
  if (/\bexcel\b/.test(p) || /\bxlsx\b/.test(p)) return "xlsx";
  if (/\bcsv\b/.test(p)) return "csv";
  return null;
}

// Helpers micrófono
async function ensureMicPermission(): Promise<
  | { ok: true }
  | { ok: false; reason: "not-secure" | "denied" | "no-device" | "system-blocked" | "unknown"; detail?: any }
> {
  // Chrome exige contexto seguro salvo localhost
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost) {
    return { ok: false, reason: "not-secure" };
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    // Algunos entornos viejos no exponen getUserMedia; dejamos que SpeechRecognition pruebe igual.
    return { ok: true };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // cerramos de inmediato para no dejar el mic en uso
    stream.getTracks().forEach((t) => t.stop());
    return { ok: true };
  } catch (err: any) {
    // Clases de error típicas: NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError
    const name = err?.name || err?.toString?.() || "";
    if (name.includes("NotAllowedError")) return { ok: false, reason: "denied", detail: err };
    if (name.includes("NotFoundError")) return { ok: false, reason: "no-device", detail: err };
    if (name.includes("NotReadableError")) return { ok: false, reason: "system-blocked", detail: err };
    return { ok: false, reason: "unknown", detail: err };
  }
}

// Hook para reconocimiento de voz con la Web Speech API + prechequeo de permisos
function useVoiceToText(options?: { lang?: string; onResult?: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const Rec =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!Rec);
    if (!Rec) return;

    const rec = new (Rec as any)();
    rec.lang = options?.lang || (typeof navigator !== "undefined" ? navigator.language : "es-ES") || "es-ES";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (ev: any) => {
      setListening(false);
      // Mensajes amigables por tipo de error de SpeechRecognition
      const e = ev?.error || "";
      console.error("[SpeechRecognition onerror]", e, ev); // debug
      switch (e) {
        case "not-allowed":
        case "service-not-allowed":
          toast.error("Permiso de micrófono denegado. Verifica el candado del navegador y habilita el micrófono.");
          break;
        case "audio-capture":
          toast.error("No se detectó micrófono o está en uso por otra app.");
          break;
        case "network":
          toast.error("Error de red durante el reconocimiento.");
          break;
        case "no-speech":
          toast.error("No se detectó voz. Intenta nuevamente.");
          break;
        case "aborted":
          // Suele ocurrir al llamar start mientras ya estaba escuchando
          toast("Dictado cancelado.", { icon: "🛑" });
          break;
        case "bad-grammar":
        case "language-not-supported":
          toast.error("Idioma no soportado para reconocimiento.");
          break;
        default:
          toast.error("Error de reconocimiento de voz.");
      }
    };
    rec.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        options?.onResult?.(transcript);
      } else {
        toast("No se capturó texto.", { icon: "🗣️" });
      }
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort?.();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (!supported || !recognitionRef.current) {
      toast.error("Reconocimiento de voz no soportado por este navegador.");
      return;
    }

    // Pre-solicitar permiso de micrófono para evitar errores inmediatos
    const perm = await ensureMicPermission();
    if (!perm.ok) {
      if (perm.reason === "not-secure") {
        toast.error("El micrófono requiere HTTPS o localhost. Abre el sitio con https:// o en localhost.");
        return;
      }
      if (perm.reason === "denied") {
        toast.error("Permiso de micrófono denegado. Habilítalo en el candado del navegador e inténtalo de nuevo.");
        return;
      }
      if (perm.reason === "no-device") {
        toast.error("No se encontró un micrófono disponible.");
        return;
      }
      if (perm.reason === "system-blocked") {
        toast.error("El sistema bloqueó el acceso al micrófono. Verifica la configuración de privacidad del SO.");
        return;
      }
      toast.error("No se pudo acceder al micrófono.");
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Puede lanzar si estaba ya en estado 'starting'
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      } catch (err2) {
        console.error("[SpeechRecognition start error]", err, err2);
        toast.error("No se pudo iniciar el dictado.");
      }
    }
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // ignore
    }
  };

  return { supported, listening, start, stop };
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
      // (CSV: solo descarga manual en botón)
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

  // Integración de voz: cuando llega un resultado, actualizamos el prompt y ejecutamos
  const { supported, listening, start, stop } = useVoiceToText({
    lang: "es-ES",
    onResult: (text) => {
      const t = (text || "").trim();
      if (!t) return;
      setPromptValue(t);
      // ejecutamos automáticamente
      handleRun(t);
      toast(`Reconocido: “${t}”`, { icon: "🎙️" });
    },
  });

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
        .voice-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }
        .voice-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(99,102,241,0.35);
          background: white;
          color: #4f46e5;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all .15s ease-in-out;
        }
        .voice-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 1px 6px rgba(79,70,229,.18);
        }
        .voice-btn[disabled] {
          opacity: .6;
          cursor: not-allowed !important;
          filter: grayscale(0.2);
        }
        .listening-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #ef4444; /* red-500 */
          animation: pulse .9s infinite alternate;
        }
        @keyframes pulse {
          from { transform: scale(0.9); opacity: .7; }
          to   { transform: scale(1.2); opacity: 1; }
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

          {/* Barra de voz independiente (no requiere modificar PromptBar) */}
          <div className="voice-bar">
            <button
              type="button"
              className="voice-btn"
              onClick={() => (listening ? stop() : start())}
              disabled={!supported || loading}
              title={
                supported
                  ? listening
                    ? "Detener dictado"
                    : "Dictar prompt por voz"
                  : "Tu navegador no soporta reconocimiento de voz"
              }
            >
              {listening ? (
                <>
                  <Square size={16} />
                  Detener
                  <span className="listening-dot" />
                </>
              ) : (
                <>
                  <Mic size={16} />
                  Dictar
                </>
              )}
            </button>
            {!supported && (
              <span className="text-xs text-gray-500">
                El reconocimiento de voz no está soportado en este navegador.
              </span>
            )}
            {supported && (
              <span className="text-xs text-gray-500">
                Idioma: {typeof navigator !== "undefined" ? navigator.language : "es-ES"}
              </span>
            )}
          </div>
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