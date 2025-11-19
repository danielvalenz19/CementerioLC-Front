import api from "./client";

// Reporte de Ocupación (Pastel/Barras)
export async function getReporteOcupacion() {
  const res = await api.get("/api/reportes/ocupacion");
  // Ajuste por si el backend devuelve { data: [...] }
  return res.data?.data || [];
}

// Reporte de Arrendamientos por rango de fechas
export async function getReporteArrendamientos(desde, hasta) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;

  const res = await api.get("/api/reportes/arrendamientos", { params });
  return res.data?.data || [];
}

// Reporte de Cartera (Mora)
export async function getReporteCartera() {
  const res = await api.get("/api/reportes/cartera");
  return res.data?.data || [];
}
