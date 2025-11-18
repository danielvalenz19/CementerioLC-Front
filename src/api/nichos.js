import api from "./client";

// Listar nichos con filtros
export async function listNichos({ manzanaId, estado, q } = {}) {
  const params = {};
  if (manzanaId) params.manzana_id = manzanaId;
  if (estado) params.estado = estado;
  if (q) params.q = q;

  const res = await api.get("/api/nichos", { params });
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
