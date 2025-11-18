import api from "./client";

export async function getOcupacion() {
  const response = await api.get("/api/reportes/ocupacion");
  return response.data;
}

export async function getAlertasVencimientos() {
  const response = await api.get("/api/alertas/vencimientos");
  return response.data;
}
