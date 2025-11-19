import api from "./client";

// Listar nichos con filtros
export async function listNichos({ manzanaId, estado, q, page, pageSize } = {}) {
  const params = {};
  // CORRECCIÓN: Cambiado de params.manzana_id a params.manzanaId para coincidir con el backend
  if (manzanaId) params.manzanaId = manzanaId;

  if (estado) params.estado = estado;
  if (q) params.q = q;
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  const res = await api.get("/api/nichos", { params });

  // El backend ahora nos devolverá { data: [...], total: 5000 }
  return res.data;
}

export async function getNichoById(id) {
  const res = await api.get(`/api/nichos/${id}`);
  return res.data;
}

// Ajusta campos al esquema real de tu backend si difiere
export async function createNicho(payload) {
  const res = await api.post("/api/nichos", payload);
  return res.data;
}

export async function updateNicho(id, payload) {
  const res = await api.put(`/api/nichos/${id}`, payload);
  return res.data;
}

export async function deleteNicho(id) {
  const res = await api.delete(`/api/nichos/${id}`);
  return res.data;
}
