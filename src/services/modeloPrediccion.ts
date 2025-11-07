// src/services/modeloPrediccion.ts
import { api } from "../lib/client";

export type ModeloPrediccionConfig = {
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
};

export async function fetchModeloConfig() {
  const { data } = await api.get<ModeloPrediccionConfig>("ml/config/");
  return data;
}

export async function updateModeloConfig(
  payload: Partial<ModeloPrediccionConfig>
) {
  const { data } = await api.patch<ModeloPrediccionConfig>("ml/config/", payload);
  return data;
}
