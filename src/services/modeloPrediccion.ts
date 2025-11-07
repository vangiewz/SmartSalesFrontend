// src/services/modeloPrediccion.ts
import { api } from "../lib/client";

// -------------------------
// Tipos
// -------------------------
export interface ModeloPrediccionConfig {
  id: number;
  nombre_modelo: string;
  horizonte_meses: number;
  n_estimators: number;
  max_depth: number | null;
  min_samples_split: number;
  min_samples_leaf: number;
  incluir_categoria: boolean;
  incluir_cliente: boolean;
  actualizado_en: string;
  actualizado_por: string | null;
}

export interface EntrenamientoModeloResponse {
  status: string;
  modelo: string;
  entrenado_en: string;
  horizonte_meses: number;
  n_estimators: number;
  max_depth: number | null;
  min_samples_split: number;
  min_samples_leaf: number;
  incluir_categoria: boolean;
  incluir_cliente: boolean;
  metric_r2: number;
  metric_mae: number;
  metric_rmse: number;
  filas_totales: number;
  filas_entrenamiento: number;
  filas_prueba: number;
  modelo_path: string;
  feature_cols: string[];
}

// ---- Puntos de serie temporal ----
export interface PuntoHistorico {
  periodo: string; // YYYY-MM-DD
  anio: number;
  mes: number;
  total_real: number;
}

export interface PuntoPrediccion {
  periodo: string; // YYYY-MM-DD
  anio: number;
  mes: number;
  total_predicho: number;
}

// ---- Predicción TOTAL mensual (modo = "total") ----
export interface PrediccionesVentasResponse {
  status: string;
  modelo: string;
  horizonte_meses: number;
  feature_cols: string[];
  filas_historico: number;
  historico: PuntoHistorico[];
  predicciones: PuntoPrediccion[];
}

// ---- Predicción por CATEGORÍA (modo = "categoria") ----
export interface PrediccionesCategoriaSerie {
  categoria_id: number;
  categoria: string;
  historico: PuntoHistorico[];
  predicciones: PuntoPrediccion[];
}

export interface PrediccionesVentasPorCategoriaResponse {
  status: string;
  modelo: string;
  horizonte_meses: number;
  feature_cols: string[];
  series: PrediccionesCategoriaSerie[];
}

// -------------------------
// Configuración del modelo
// -------------------------
export async function fetchModeloConfig(): Promise<ModeloPrediccionConfig> {
  const { data } = await api.get<ModeloPrediccionConfig>("/ml/config/");
  return data;
}

export async function updateModeloConfig(
  payload: Partial<ModeloPrediccionConfig>
): Promise<ModeloPrediccionConfig> {
  const { data } = await api.patch<ModeloPrediccionConfig>("/ml/config/", payload);
  return data;
}

// -------------------------
// Entrenamiento del modelo
// -------------------------
export async function trainModeloIA(): Promise<EntrenamientoModeloResponse> {
  const { data } = await api.post<EntrenamientoModeloResponse>("/ml/train/", {});
  return data;
}

// -------------------------
// Predicciones (UC-24 / UC-27)
// -------------------------

/**
 * Predicciones de TOTAL mensual.
 * Internamente llama a /api/ml/predict/ con modo = "total".
 *
 * - Si no envías horizonte_meses, el backend usa el de la config.
 */
export async function fetchPrediccionesVentas(
  horizonte_meses?: number
): Promise<PrediccionesVentasResponse> {
  const body: any = { modo: "total" };
  if (typeof horizonte_meses === "number") {
    body.horizonte_meses = horizonte_meses;
  }

  const { data } = await api.post<PrediccionesVentasResponse>("/ml/predict/", body);
  return data;
}

/**
 * Predicciones agregadas por CATEGORÍA (tipoproducto).
 * Llama a /api/ml/predict/ con modo = "categoria".
 *
 * La respuesta trae una lista de categorías, cada una con su histórico
 * y su serie de predicciones.
 */
export async function fetchPrediccionesVentasPorCategoria(
  horizonte_meses?: number
): Promise<PrediccionesVentasPorCategoriaResponse> {
  const body: any = { modo: "categoria" };
  if (typeof horizonte_meses === "number") {
    body.horizonte_meses = horizonte_meses;
  }

  const { data } = await api.post<PrediccionesVentasPorCategoriaResponse>(
    "/ml/predict/",
    body
  );
  return data;
}
