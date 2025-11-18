import React from "react";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();

  const userJson = localStorage.getItem("user");
  let nombreUsuario = "";

  try {
    if (userJson) {
      const user = JSON.parse(userJson);
      // Ajusta según lo que devuelva tu backend (nombre, nombre_completo, etc.)
      nombreUsuario = user.nombre || user.nombre_completo || user.correo || "";
    }
  } catch (e) {
    console.error("Error leyendo usuario de localStorage", e);
  }

  const handleLogout = () => {
    // Por ahora solo limpiamos localStorage y mandamos al login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e9f5ff",
      }}
    >
      <div
        style={{
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          ¡Bienvenido al sistema de Cementerio!
        </h1>
        {nombreUsuario && (
          <p style={{ fontSize: "18px", marginBottom: "16px" }}>
            Hola, <strong>{nombreUsuario}</strong>.
          </p>
        )}
        <p style={{ marginBottom: "24px" }}>
          El login funcionó correctamente. Desde aquí vamos a construir el resto
          del sistema (manzanas, nichos, propietarios, etc.).
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#dc3545",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
