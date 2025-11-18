import api from "./client";

// Listado con filtros (para usos específicos)
export async function fetchNichos({
  manzanaId,
  estado,
  search,
  page = 1,
  pageSize = 20,
} = {}) {
  const params = { page, pageSize };

  if (manzanaId && manzanaId !== "all") {
    params.manzanaId = manzanaId;
  }

  if (estado && estado !== "Todos") {
    params.estado = estado;
  }

  if (search && search.trim() !== "") {
    params.q = search.trim();
  }

  const res = await api.get("/api/nichos", { params });
  const payload = res.data;

  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  const meta = Array.isArray(payload)
    ? { page, pageSize, count: items.length }
    : {
        page: payload.page ?? page,
        pageSize: payload.pageSize ?? pageSize,
        count: payload.count ?? items.length,
      };

  return { items, meta };
}

// Nichos disponibles para selects
export async function fetchNichosDisponibles() {
  const { items } = await fetchNichos({
    estado: "Disponible",
    page: 1,
    pageSize: 500,
  });
  return items;
}
