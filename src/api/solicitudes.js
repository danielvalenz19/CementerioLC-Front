import api from "./client";

// LISTADO CON FILTROS
export async function listSolicitudes({ estado, propietarioId, nichoId } = {}) {
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

  const res = await api.get("/api/solicitudes", { params });
  const payload = res.data;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return items;
}

// DETALLE
export async function getSolicitudById(id) {
  const res = await api.get(`/api/solicitudes/${id}`);
  return res.data;
}

// CREAR
export async function createSolicitud(payload) {
  const res = await api.post("/api/solicitudes", payload);
  return res.data;
}

// APROBAR (opcional recibo_id)
export async function aprobarSolicitud(id, reciboId) {
  const body = {};
  if (reciboId && reciboId.trim() !== "") {
    body.recibo_id = reciboId.trim();
  }

  const res = await api.post(`/api/solicitudes/${id}/aprobar`, body);
  return res.data;
}

// RECHAZAR
export async function rechazarSolicitud(id) {
  const res = await api.post(`/api/solicitudes/${id}/rechazar`, {});
  return res.data;
}
