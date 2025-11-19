import api from "./client";

// Catálogos generales (manzanas, estados, etc.)
export async function fetchCatalogos() {
  const res = await api.get("/api/catalogos");
  return res.data;
}

// Catálogo de propietarios para selects
export async function fetchCatalogoPropietarios() {
  const res = await api.get("/api/propietarios");
  const payload = res.data;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
}
