import api from "./client";

export async function getCatalogoManzanas() {
  const res = await api.get("/api/catalogos/manzanas");
  return res.data;
}
