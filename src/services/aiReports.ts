import { api, ngrokApi } from "../lib/client";

export type AIReportResponse = {
  columns: string[];
  rows: (string | number | null)[][];
  intent?: string;
  start?: string;
  end?: string;
  filters?: Record<string, any>;
};

// ================== PLANTILLAS ===================

export type PlantillaReporte = {
  id: number;
  nombre: string;
  prompt: string;
  formato?: "pdf" | "xlsx" | "csv" | null;
  filtros?: Record<string, any> | null;
  creado_en?: string;
  actualizado_en?: string;
};

// Lista todas las plantillas del usuario autenticado
export async function fetchPlantillas(): Promise<PlantillaReporte[]> {
  const res = await api.get("/ai-reports/plantillas/");
  const data = res.data;

  // 👀 Para ver qué viene realmente del backend
  console.log("[AI] plantillas response:", data);

  // 1) Si ya es un array, perfecto
  if (Array.isArray(data)) {
    return data as PlantillaReporte[];
  }

  // 2) Si viene envuelto en { results: [...] }
  if (Array.isArray((data as any)?.results)) {
    return (data as any).results as PlantillaReporte[];
  }

  // 3) Cualquier otra cosa: no rompas la UI
  return [];
}

// Crea una nueva plantilla
export async function createPlantilla(data: {
  nombre: string;
  prompt: string;
  formato?: "pdf" | "xlsx" | "csv" | null;
  filtros?: Record<string, any> | null;
}): Promise<PlantillaReporte> {
  const res = await api.post("/ai-reports/plantillas/", data);
  return res.data as PlantillaReporte;
}

// Elimina una plantilla por ID
export async function deletePlantilla(id: number): Promise<void> {
  await api.delete(`/ai-reports/plantillas/${id}/`);
}

// Edita una plantilla
export async function updatePlantilla(
  id: number,
  data: Partial<PlantillaReporte>
): Promise<PlantillaReporte> {
  const res = await api.put(`/ai-reports/plantillas/${id}/`, data);
  return res.data as PlantillaReporte;
}

// ================== REPORTES IA ===================

/** Asegura shape {columns:string[], rows:[][]} a partir del JSON que venga. */
function normalize(json: any): AIReportResponse {
  const intent = json?.intent;
  const start = json?.start;
  const end = json?.end;
  const filters = json?.filters ?? {};

  // Si el backend ya manda columns y rows en el shape esperado, respétalo.
  if (Array.isArray(json?.columns) && Array.isArray(json?.rows)) {
    return {
      intent,
      start,
      end,
      filters,
      columns: json.columns as string[],
      rows: json.rows as (string | number | null)[][],
    };
  }

  // Si manda results: [...] (objetos), lo convertimos a columns/rows.
  const results: any[] = Array.isArray(json?.results) ? json.results : [];

  if (results.length > 0 && typeof results[0] === "object" && results[0] !== null) {
    // Orden preferido cuando el intent es ventas_detalladas
    const preferredOrder =
      intent === "ventas_detalladas"
        ? [
            "fecha",
            "venta_id",
            "cliente",
            "direccion",
            "producto_id",
            "producto",
            "marca",
            "categoria",
            "cantidad",
            "precio_unit",
            "subtotal",
            "total_venta",
            "limitegarantia",
          ]
        : [];

    const keysInResult = Object.keys(results[0]);

    // Construimos el orden final: primero preferred (si existen), luego el resto.
    const orderedKeys: string[] = [
      ...preferredOrder.filter((k) => keysInResult.includes(k)),
      ...keysInResult.filter((k) => !preferredOrder.includes(k)),
    ];

    const columns = orderedKeys.map((k) => k); // UI espera string[]
    const rows = results.map((r) =>
      orderedKeys.map((k) => (r[k] === undefined ? null : r[k]))
    );

    return {
      intent,
      start,
      end,
      filters,
      columns,
      rows,
    };
  }

  // Fallback: si todo falla, devuelve estructura vacía coherente
  return {
    intent,
    start,
    end,
    filters,
    columns: [],
    rows: [],
  };
}

// --- API calls -------------------------------------------------------------

/** Ejecuta el reporte por prompt y devuelve columns/rows normalizados. */
export async function runAIReport(prompt: string): Promise<AIReportResponse> {
  const resp = await ngrokApi.post("ai-reports/run", {
    prompt,
    formato: "json", // fuerza JSON para normalizar en el front
  });
  return normalize(resp.data);
}

/**
 * Descarga un archivo (csv/xlsx/pdf) como Blob.
 * El backend debe aceptar formato y devolver blob desde el mismo endpoint.
 */
export async function downloadAIReportBlob(
  prompt: string,
  formato: "csv" | "xlsx" | "pdf"
): Promise<Blob> {
  const resp = await ngrokApi.post(
    "ai-reports/run",
    { prompt, formato },
    { responseType: "blob" }
  );
  return resp.data as Blob;
}
