import api from "./client";

export async function listRecibos({ desde, hasta, search } = {}) {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  if (search) params.search = search;

  const res = await api.get("/api/recibos", { params });
  const payload = res.data;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export async function createRecibo(payload) {
  const res = await api.post("/api/recibos", payload);
  return res.data;
}
