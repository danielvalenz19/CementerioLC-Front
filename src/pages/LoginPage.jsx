import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await login(correo, password);

      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      if (data?.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/app", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos, o error de servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <h1>Gestiona el cementerio con claridad.</h1>
        <p>
          Administra nichos, propietarios, arrendamientos y reportes
          desde un solo panel moderno.
        </p>

        <div className="login-hero-cards">
          <div className="hero-card hero-card-primary">
            <span className="hero-card-label">Ocupación actual</span>
            <h2>78.3%</h2>
            <p>Nichos ocupados en el cementerio.</p>
          </div>
          <div className="hero-card hero-card-soft">
            <span className="hero-card-label">Alertas</span>
            <h2>12</h2>
            <p>Arrendamientos por vencer en 30 días.</p>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <p>Accede al panel administrativo</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="form-label">
              Correo electrónico
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="tu-correo@ejemplo.com"
              />
            </label>

            <label className="form-label">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </label>

            {error && <div className="form-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
