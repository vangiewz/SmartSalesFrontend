// src/services/aiReports.ts
import { api } from '../lib/client'

export type AIReportResponse = {
  columns: string[];
  rows: (string | number | null)[][];
  intent: string;
  start?: string;
  end?: string;
  filters?: Record<string, any>;
};

export async function runAIReport(prompt: string) {
  const { data } = await api.post("ai-reports/run", { prompt }); // ← sin '/'
  return data;
}

export async function downloadAIReportBlob(prompt: string, format: "csv"|"xlsx"|"pdf") {
  const { data } = await api.post(
    "ai-reports/download",          // ← sin '/'
    { prompt, format },
    { responseType: "blob" }
  );
  return data as Blob;
}
