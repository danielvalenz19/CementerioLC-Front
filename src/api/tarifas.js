import api from "./client";

// Listar todas las tarifas
export async function listTarifas() {
  const res = await api.get("/api/tarifas");
  const payload = res.data;

  // Validación para asegurar que siempre devolvemos un array
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return items;
}

// Crear una nueva tarifa
export async function createTarifa(data) {
  const res = await api.post("/api/tarifas", data);
  return res.data;
}

// Actualizar una tarifa existente
export async function updateTarifa(id, data) {
  const res = await api.put(`/api/tarifas/${id}`, data);
  return res.data;
}

export async function deleteTarifa(id) {
  const res = await api.delete(`/api/tarifas/${id}`);
  return res.data;
}
