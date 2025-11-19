import api from "./client";

export async function listUsuarios() {
  const res = await api.get("/api/usuarios");
  return res.data;
}

export async function createUsuario(data) {
  const res = await api.post("/api/usuarios", data);
  return res.data;
}

export async function toggleUsuarioEstado(id, activo) {
  const res = await api.patch(`/api/usuarios/${id}/estado`, { activo });
  return res.data;
}

// Nueva función para eliminar
export async function deleteUsuario(id) {
  const res = await api.delete(`/api/usuarios/${id}`);
  return res.data;
}
