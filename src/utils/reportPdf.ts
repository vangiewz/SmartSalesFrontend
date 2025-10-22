import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AIReportResponse } from "../services/aiReports";

export function buildFilename(rep: AIReportResponse | null, ext: string) {
  const intent = rep?.intent || "reporte";
  const start = rep?.start?.slice(0,10) || "";
  const end   = rep?.end?.slice(0,10) || "";
  return `${intent}_${start}_${end}.${ext}`;
}

export function exportPdf(rep: AIReportResponse) {
  const doc = new jsPDF({ unit: "pt" });
  const title = `Reporte: ${rep.intent}`;
  const subtitle = `Rango: ${rep.start} → ${rep.end}`;

  doc.setFontSize(16);
  doc.text(title, 40, 40);
  doc.setFontSize(11);
  doc.text(subtitle, 40, 60);

  const filtersText = Object.keys(rep.filters||{}).length
    ? "Filtros: " + Object.entries(rep.filters).map(([k,v]) => `${k}: ${v}`).join(", ")
    : "";
  if (filtersText) doc.text(filtersText, 40, 78);

  autoTable(doc, {
    head: [rep.columns],
    body: rep.rows.map(r => rep.columns.map(c => fmt(r[c]))),
    startY: 100,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [63,81,181] }
  });

  doc.save(buildFilename(rep, "pdf"));
}

function fmt(v: any) {
  if (v == null) return "—";
  if (typeof v === "number") {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(v);
  }
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    return v.slice(0,10);
  }
  return String(v);
}
