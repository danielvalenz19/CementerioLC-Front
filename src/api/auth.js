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

export async function refreshToken() {
  const token = localStorage.getItem("refresh_token");
  if (!token) throw new Error("No hay refresh token");

  const response = await api.post("/auth/refresh", {
    refresh_token: token,
  });

  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
  }
  if (response.data.refresh_token) {
    localStorage.setItem("refresh_token", response.data.refresh_token);
  }

  return response.data;
}
