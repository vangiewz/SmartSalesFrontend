import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type AIReportLike = {
  columns: string[]; // ej. ["mes","monto"]
  // Puede venir como [{mes:..., monto:...}, ...] o como [[...], [...]]
  rows: Array<Record<string, unknown> | (string | number | null)[]>;
  intent?: string;
  start?: string;
  end?: string;
  filters?: Record<string, unknown>;
};

/* ========= Nombre de archivo ========= */
export function buildFilename(
  report: Partial<AIReportLike> | null,
  format: "csv" | "xlsx" | "pdf"
): string {
  const rawIntent = (report?.intent ?? "reporte").toString();
  const intent = sanitizeFilename(rawIntent).toLowerCase().replace(/\s+/g, "_");
  const rango =
    report?.start && report?.end
      ? `${sanitizeFilename(report.start)}_${sanitizeFilename(report.end)}`
      : new Date().toISOString().slice(0, 10);
  return `${intent}_${rango}.${format}`;
}

/* ========= PDF MEJORADO ========= */
export function exportPdf(report: AIReportLike): void {
  const cols = Array.isArray(report.columns) ? report.columns : [];
  const body = normalizeRowsToAoa(report.rows, cols);

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;
  const marginRight = 40;
  let y = 50;

  // ========= HEADER MODERNO CON DEGRADADO =========
  // Fondo degradado (simulado con rectángulos superpuestos)
  doc.setFillColor(99, 102, 241); // Indigo 500
  doc.rect(0, 0, pageWidth, 120, "F");
  doc.setFillColor(139, 92, 246); // Purple overlay
  // @ts-ignore (GState existe en runtime; typings pueden no incluirlo)
  doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
  doc.rect(0, 0, pageWidth, 120, "F");
  // @ts-ignore
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Título principal
  const title = (report.intent ?? "Reporte").toString().toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(title, marginLeft, y);
  y += 30;

  // Subtítulo con metadatos
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(240, 240, 255);

  let metaText = "";
  if (report.start && report.end) {
    metaText += `📅 Rango: ${report.start} → ${report.end}`;
  }

  if (report.filters && Object.keys(report.filters).length > 0) {
    const filtersStr = Object.entries(report.filters)
      .map(([k, v]) => `${k}: ${formatCell(v)}`)
      .join(" • ");
    metaText += metaText ? `  |  🔍 Filtros: ${filtersStr}` : `🔍 Filtros: ${filtersStr}`;
  }

  if (metaText) {
    const wrapped = doc.splitTextToSize(metaText, pageWidth - marginLeft - marginRight - 20);
    doc.text(wrapped, marginLeft, y);
    y += wrapped.length * 14;
  }

  // Info adicional
  doc.setFontSize(9);
  doc.text(`📊 Total de registros: ${body.length}`, marginLeft, y + 10);
  doc.text(`📄 Generado: ${new Date().toLocaleString("es-AR")}`, pageWidth - marginRight - 200, y + 10);

  y = 140; // Después del header

  // ========= KPIs (si hay columnas numéricas) =========
  const numericCols = detectNumericColumns(report.rows, cols);
  if (numericCols.length > 0) {
    const kpis = calculateKPIs(report.rows, numericCols[0], cols);

    // Dibujar KPI cards
    const cardWidth = 150;
    const cardHeight = 70;
    const gap = 20;
    let xPos = marginLeft;

    const kpiData = [
      { label: "TOTAL", value: kpis.total, color: [99, 102, 241] as [number, number, number] },
      { label: "PROMEDIO", value: kpis.avg, color: [139, 92, 246] as [number, number, number] },
      { label: "MÁXIMO", value: kpis.max, color: [236, 72, 153] as [number, number, number] },
      { label: "REGISTROS", value: body.length, color: [59, 130, 246] as [number, number, number] },
    ];

    kpiData.forEach((kpi) => {
      // Card background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(xPos, y, cardWidth, cardHeight, 8, 8, "F");

      // Border color
      doc.setDrawColor(...kpi.color);
      doc.setLineWidth(2);
      doc.roundedRect(xPos, y, cardWidth, cardHeight, 8, 8, "S");

      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(kpi.label, xPos + 10, y + 20);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...kpi.color);
      const valueStr = typeof kpi.value === "number"
        ? new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(kpi.value)
        : String(kpi.value);
      doc.text(valueStr, xPos + 10, y + 50);

      xPos += cardWidth + gap;
    });

    y += cardHeight + 30;
  }

  // ========= TABLA CON ESTILO PREMIUM =========
  autoTable(doc, {
    startY: y,
    head: [cols.map((c) => String(c ?? "").toUpperCase())],
    body,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 8,
      lineColor: [230, 230, 230],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [99, 102, 241], // Indigo 500
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // Gray 50
    },
    rowPageBreak: "avoid",
    margin: { left: marginLeft, right: marginRight },
    theme: "grid",

    // Formato condicional para números
    didParseCell: (data) => {
      if (data.section === "body" && typeof data.cell.raw === "number") {
        data.cell.styles.halign = "right";
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // ========= FOOTER EN CADA PÁGINA =========
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, pageHeight - 40, pageWidth - marginRight, pageHeight - 40);

    // Texto del footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Reporte generado con IA | ${new Date().toLocaleDateString("es-AR")}`,
      marginLeft,
      pageHeight - 25
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - marginRight - 60,
      pageHeight - 25
    );
  }

  doc.save(buildFilename(report, "pdf"));
}

/* ========= Excel SOLO TABLA ========= */
export function exportExcel(report: AIReportLike): void {
  const cols = Array.isArray(report.columns) ? report.columns : [];
  const body = normalizeRowsToAoa(report.rows, cols);

  const wb = XLSX.utils.book_new();

  // SOLO TABLA: headers + data (igual a la tabla de la UI)
  const dataAoa: (string | number)[][] = [
    cols.map((c) => String(c ?? "").toUpperCase()),
    ...body.map((r) => r.map((c) => c ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(dataAoa);

  // Autofiltro en la tabla
  ws["!autofilter"] = {
    ref: `A1:${XLSX.utils.encode_col(Math.max(cols.length - 1, 0))}${Math.max(body.length, 0) + 1}`,
  };

  // Ancho de columnas automático
  ws["!cols"] = computeColWidths(dataAoa);

  XLSX.utils.book_append_sheet(wb, ws, "Reporte");

  XLSX.writeFile(wb, buildFilename(report, "xlsx"));
}

/* ========= Helpers ========= */

function sanitizeFilename(s: string): string {
  return s.replace(/[\/\\?%*:|"<>]/g, "_").trim();
}

function normalizeRowsToAoa(
  rows: Array<Record<string, unknown> | (string | number | null)[]>,
  columns: string[]
): (string | number | null)[][] {
  const cols = Array.isArray(columns) ? columns : [];
  const rawRows = Array.isArray(rows) ? rows : [];

  return rawRows.map((row) => {
    if (Array.isArray(row)) {
      return cols.map((_, i) => formatCell(row[i]));
    }
    const obj = row as Record<string, unknown>;
    return cols.map((col) => formatCell(obj[col]));
  });
}

function isISODateString(x: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(x);
}

function formatCell(v: unknown): string | number | null {
  if (v == null) return "";
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    if (isISODateString(v)) return v.slice(0, 10);
    return v;
  }
  if (v instanceof Date && !isNaN(v.valueOf())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (typeof obj.display === "string") return obj.display;
    if (
      typeof obj.value === "string" ||
      typeof obj.value === "number" ||
      obj.value instanceof Date
    )
      return formatCell(obj.value as any);
    try {
      return JSON.stringify(obj);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function computeColWidths(aoa: (string | number)[][]): Array<{ wch: number }> {
  const colCount = aoa[0]?.length ?? 0;
  const widths = new Array(colCount).fill(12); // mínimo
  aoa.forEach((row) => {
    row.forEach((cell, i) => {
      const len =
        typeof cell === "number"
          ? cell.toString().length
          : (cell ?? "").toString().length;
      widths[i] = Math.max(widths[i], Math.min(len + 4, 50)); // tope 50
    });
  });
  return widths.map((wch) => ({ wch }));
}

// Detecta columnas numéricas
function detectNumericColumns(
  rows: Array<Record<string, unknown> | (string | number | null)[]>,
  columns: string[]
): string[] {
  if (!rows || rows.length === 0) return [];

  const firstRow = rows[0];
  if (Array.isArray(firstRow)) {
    return columns.filter((_, idx) => typeof firstRow[idx] === "number");
    }
  const obj = firstRow as Record<string, unknown>;
  return columns.filter((col) => typeof obj[col] === "number");
}

// Calcula KPIs para una columna numérica
function calculateKPIs(
  rows: Array<Record<string, unknown> | (string | number | null)[]>,
  column: string,
  columns: string[]
): { total: number; avg: number; max: number; min: number } {
  const values: number[] = [];

  rows.forEach((row) => {
    let val: unknown;
    if (Array.isArray(row)) {
      const idx = columns.indexOf(column);
      val = row[idx];
    } else {
      val = (row as Record<string, unknown>)[column];
    }

    if (typeof val === "number") {
      values.push(val);
    }
  });

  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length > 0 ? total / values.length : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;

  return { total, avg, max, min };
}