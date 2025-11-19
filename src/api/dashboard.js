import api from "./client";

// Reporte de ocupación (para gráficas de estado)
export async function getOcupacion() {
  const res = await api.get("/api/reportes/ocupacion");
  // El backend devuelve { data: [...] }
  return res.data?.data || [];
}

// Alertas de vencimiento (para lista de urgencias)
export async function getAlertasVencimientos() {
  const res = await api.get("/api/alertas/vencimientos");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}

// Recibos recientes (para gráfica financiera simple)
export async function getRecibosRecientes() {
  // Pedimos la primera página para calcular ingresos recientes
  const res = await api.get("/api/recibos?page=1&pageSize=10");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}
