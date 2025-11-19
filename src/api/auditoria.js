import api from "./client";

// Obtener historial de auditoría con filtros
export async function listAuditoria(filters = {}) {
  const params = {};

  // Mapeamos los filtros a los parámetros que espera el backend (src/controllers/auditoria.controller.js)
  if (filters.usuario_id) params.usuario_id = filters.usuario_id;
  if (filters.desde) params.desde = filters.desde;
  if (filters.hasta) params.hasta = filters.hasta;

  const res = await api.get("/api/auditoria", { params });
  const payload = res.data;

  // Manejo robusto de la respuesta
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}
