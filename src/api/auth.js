import api from "./client";

// Login
export async function login(correo, password) {
  const response = await api.post("/auth/login", { correo, password });
  return response.data;
}

// Usuario actual
export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data;
}

// Logout (revocar refresh token actual)
export async function doLogout({ allDevices = false } = {}) {
  const refreshToken = localStorage.getItem("refresh_token");

  try {
    await api.post("/auth/logout", {
      allDevices,
      refresh_token: refreshToken,
    });
  } catch (err) {
    // Si falla, igual limpiamos sesión en frontend
    console.error("Error en logout:", err);
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }
}
