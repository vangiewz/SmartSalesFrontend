import { useState } from "react";
import { Sparkles, Download } from "lucide-react";

type Props = {
  loading: boolean;
  onRun: (prompt: string) => void;
  onDownload: (format: "csv"|"xlsx"|"pdf") => void;
};

export default function PromptBar({ loading, onRun, onDownload }: Props) {
  const [prompt, setPrompt] = useState('ventas realizadas en enero y febrero 2025');

  return (
    <div className="bg-white rounded-2xl shadow p-4 sm:p-6 border">
      <label className="block text-sm font-medium text-gray-700 mb-2">Escribe tu prompt</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder='Ej: "ventas del producto Galaxy S23 128GB en febrero 2025"'
      />
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onRun(prompt)}
          disabled={loading || !prompt.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? "Generando..." : "Generar reporte"}
        </button>
        <div className="flex gap-2">
          <button onClick={() => onDownload("xlsx")} disabled={loading||!prompt.trim()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => onDownload("csv")} disabled={loading||!prompt.trim()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={() => onDownload("pdf")} disabled={loading||!prompt.trim()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>
    </div>
  );
}
