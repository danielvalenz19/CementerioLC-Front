import api from "./client";

export async function getCatalogoManzanas() {
  const res = await api.get("/api/manzanas");
  return res.data;
}
