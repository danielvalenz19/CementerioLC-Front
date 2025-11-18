import api from "./client";

// LISTADO CON FILTROS
export async function listArrendamientos({ estado, propietarioId, nichoId } = {}) {
  const params = {};

  if (estado && estado !== "Todos") {
    params.estado = estado;
  }

  if (propietarioId && propietarioId !== "all") {
    params.propietario_id = propietarioId;
  }

  if (nichoId && nichoId.trim() !== "") {
    params.nicho_id = nichoId.trim();
  }

  const res = await api.get("/api/arrendamientos", { params });
  const payload = res.data;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return items;
}

// DETALLE
export async function getArrendamientoById(id) {
  const res = await api.get(`/api/arrendamientos/${id}`);
  return res.data;
}

// CREAR
export async function createArrendamiento(payload) {
  const res = await api.post("/api/arrendamientos", payload);
  return res.data;
}

// RENOVAR
export async function renovarArrendamiento(id, nuevaFechaFin) {
  const body = {
    fecha_fin: nuevaFechaFin,
  };

  const res = await api.post(`/api/arrendamientos/${id}/renovar`, body);
  return res.data;
}

// CANCELAR
export async function cancelarArrendamiento(id) {
  const res = await api.post(`/api/arrendamientos/${id}/cancelar`, {});
  return res.data;
}
