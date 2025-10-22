// src/utils/reportPdf.ts

// Tipo mínimo compatible con tu respuesta del backend
export type AIReportLike = {
  columns: string[];
  rows: (string | number | null)[][];
  intent?: string;
  start?: string;
  end?: string;
  filters?: Record<string, unknown>;
};

/**
 * Construye un nombre de archivo seguro, con defaults si faltan campos.
 */
export function buildFilename(
  report: Partial<AIReportLike> | null,
  format: "csv" | "xlsx" | "pdf"
): string {
  const rawIntent = (report?.intent ?? "reporte").toString();
  const intent = sanitizeFilename(rawIntent).toLowerCase().replace(/\s+/g, "_");

  // Si no hay rango, usa fecha de hoy (YYYY-MM-DD)
  const rango =
    report?.start && report?.end
      ? `${sanitizeFilename(report.start)}_${sanitizeFilename(report.end)}`
      : new Date().toISOString().slice(0, 10);

  return `${intent}_${rango}.${format}`;
}

/**
 * Exporta a “PDF” abriendo una ventana imprimible sin librerías externas.
 * (El usuario puede guardar como PDF desde el diálogo de impresión del navegador).
 */
export function exportPdf(report: AIReportLike): void {
  const { columns, rows } = report;

  // Normaliza filters para evitar undefined y tipar Object.entries correctamente
  const filtersObj: Record<string, unknown> = (report.filters ??
    {}) as Record<string, unknown>;

  // Armamos una tabla HTML simple
  const filtersHtml = buildFiltersHtml(filtersObj);
  const tableHtml = buildTableHtml(columns, rows);

  const title = (report.intent ?? "Reporte").toString();
  const subtitleRange =
    report.start && report.end
      ? `<div style="margin-top:4px;color:#4b5563;font-size:12px;">
           Rango: ${escapeHtml(report.start)} — ${escapeHtml(report.end)}
         </div>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; color: #111827; }
  h1 { margin: 0; font-size: 20px; }
  .muted { color: #4b5563; font-size: 12px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
  th { background: #f3f4f6; }
  .filters { margin-top: 8px; }
  .filters span { display:inline-block; background:#eef2ff; color:#3730a3; padding:4px 8px; border-radius:9999px; margin:4px 8px 0 0; font-size:11px; }
  @media print {
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div style="display:flex; align-items:center; justify-content:space-between;">
    <div>
      <h1>${escapeHtml(title)}</h1>
      ${subtitleRange}
    </div>
    <button class="no-print" onclick="window.print()" style="padding:8px 12px; border:1px solid #e5e7eb; border-radius:8px; background:#111827; color:#fff; cursor:pointer;">
      Imprimir / Guardar PDF
    </button>
  </div>

  ${filtersHtml}

  <div class="card">
    ${tableHtml}
  </div>
</body>
</html>
`.trim();

  const w = window.open("", "_blank");
  if (!w) return; // popup bloqueado
  w.document.write(html);
  w.document.close();
  // No forzamos print automático; el botón permite al usuario revisar/guardar.
}

/* ======================= Helpers ======================= */

function sanitizeFilename(s: string): string {
  return s.replace(/[\/\\?%*:|"<>]/g, "_").trim();
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildFiltersHtml(filters: Record<string, unknown>): string {
  const entries = Object.entries(filters); // <-- ya es Record, no undefined
  if (entries.length === 0) return "";

  const pills = entries
    .map(([k, v]) => {
      // tipado seguro: v puede ser string/number/bool/array/obj/null
      const val =
        v == null
          ? ""
          : typeof v === "object"
          ? escapeHtml(JSON.stringify(v))
          : escapeHtml(String(v));
      return `<span>${escapeHtml(k)}: ${val}</span>`;
    })
    .join("");

  return `
    <div class="card">
      <div class="muted">Filtros aplicados</div>
      <div class="filters">${pills}</div>
    </div>
  `.trim();
}

function buildTableHtml(columns: string[], rows: (string | number | null)[][]): string {
  const thead = `
    <thead>
      <tr>
        ${columns.map((c) => `<th>${escapeHtml(String(c))}</th>`).join("")}
      </tr>
    </thead>
  `.trim();

  const tbody = `
    <tbody>
      ${rows
        .map(
          (r) =>
            `<tr>${r
              .map((cell) =>
                cell == null ? "<td></td>" : `<td>${escapeHtml(String(cell))}</td>`
              )
              .join("")}</tr>`
        )
        .join("")}
    </tbody>
  `.trim();

  return `<table>${thead}${tbody}</table>`;
}
