// services/aiReports.ts
// API PARA REPORTES IA (no toca services/api.ts)

export type AIReportResponse = {
  intent: string;
  rows: Record<string, any>[];
  columns: string[];
  start: string;
  end: string;
  filters: Record<string, any>;
};

const BASE = "/api/ai-reports";

/**
 * Verifica que la respuesta HTTP sea válida (status 200–299)
 * y lanza un Error con el texto devuelto en caso contrario.
 */
async function handle(res: Response): Promise<Response> {
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      text = "Error desconocido al leer la respuesta del servidor.";
    }
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res;
}

/**
 * Genera el reporte en formato JSON para mostrarlo en la interfaz.
 */
export async function runAIReport(prompt: string): Promise<AIReportResponse> {
  const res = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, formato: "json" }),
  });

  await handle(res);
  return res.json();
}

/**
 * Descarga el reporte en formato CSV o XLSX.
 */
export async function downloadAIReportBlob(
  prompt: string,
  formato: "csv" | "xlsx"
): Promise<Blob> {
  const res = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, formato }),
  });

  await handle(res);
  return res.blob();
}
