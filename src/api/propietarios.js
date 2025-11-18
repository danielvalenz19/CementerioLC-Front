import api from "./client";

// LISTA CON BÚSQUEDA (nombre/DPI)
export async function listPropietarios(search = "") {
  const params = {};
  if (search) params.search = search;

  const res = await api.get("/api/propietarios", { params });
  const payload = res.data;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return items;
}

// DETALLE DE UN PROPIETARIO
export async function getPropietarioById(id) {
  const res = await api.get(`/api/propietarios/${id}`);
  return res.data;
}

// CREAR
export async function createPropietario(payload) {
  const res = await api.post("/api/propietarios", payload);
  return res.data;
}

// ACTUALIZAR
export async function updatePropietario(id, payload) {
  const res = await api.put(`/api/propietarios/${id}`, payload);
  return res.data;
}

// ELIMINAR
export async function deletePropietario(id) {
  const res = await api.delete(`/api/propietarios/${id}`);
  return res.data;
}

/* ========= HISTORIAL DEL PROPIETARIO ========= */

function normalizeArrayResponse(res) {
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function getArrendamientosByPropietario(propietarioId) {
  if (!propietarioId) return [];
  const res = await api.get("/api/arrendamientos", {
    params: { propietario_id: propietarioId },
  });
  return normalizeArrayResponse(res);
}

export async function getSolicitudesByPropietario(propietarioId) {
  if (!propietarioId) return [];
  const res = await api.get("/api/solicitudes", {
    params: { propietario_id: propietarioId },
  });
  return normalizeArrayResponse(res);
}

export async function getTraspasosByPropietario(propietarioId) {
  if (!propietarioId) return [];
  const res = await api.get("/api/traspasos", {
    params: { propietario_id: propietarioId },
  });
  return normalizeArrayResponse(res);
}
