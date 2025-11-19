import api from "./client";

// Obtener alertas de vencimientos (próximos 30 días)
export async function getAlertasVencimientos() {
  const res = await api.get("/api/alertas/vencimientos");
  const payload = res.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}
