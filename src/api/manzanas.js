import api from "./client";

// Lista de manzanas con búsqueda opcional
export async function listManzanas(search = "") {
  const params = {};
  if (search) params.search = search;

  const res = await api.get("/api/manzanas", { params });
  return res.data;
}

// Crear manzana
export async function createManzana({ nombre }) {
  const res = await api.post("/api/manzanas", { nombre });
  return res.data;
}

// Actualizar manzana
export async function updateManzana(id, { nombre }) {
  const res = await api.put(`/api/manzanas/${id}`, { nombre });
  return res.data;
}

// Eliminar manzana
export async function deleteManzana(id) {
  const res = await api.delete(`/api/manzanas/${id}`);
  return res.data;
}
