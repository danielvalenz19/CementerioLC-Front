import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import {
  getAlertasVencimientos,
  getOcupacion,
} from "../api/dashboard";

function LoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [metricLoading, setMetricLoading] = useState(true);
  const [metricError, setMetricError] = useState("");
  const [ocupacion, setOcupacion] = useState([]);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      setMetricLoading(true);
      setMetricError("");
      try {
        const [ocupacionRes, alertasRes] = await Promise.allSettled([
          getOcupacion(),
          getAlertasVencimientos(),
        ]);

        if (!isMounted) return;

        if (ocupacionRes.status === "fulfilled") {
          const data = ocupacionRes.value;
          setOcupacion(Array.isArray(data) ? data : []);
        } else {
          console.error("Error al cargar ocupación", ocupacionRes.reason);
          setMetricError(
            (prev) => prev || "No se pudo cargar el estado de ocupación."
          );
        }

        if (alertasRes.status === "fulfilled") {
          const data = alertasRes.value;
          setAlertas(Array.isArray(data) ? data : []);
        } else {
          console.error("Error al cargar alertas", alertasRes.reason);
          setMetricError(
            (prev) => prev || "No se pudieron cargar las alertas activas."
          );
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error al cargar métricas públicas", err);
        setMetricError("No se pudieron cargar las métricas en tiempo real.");
      } finally {
        if (isMounted) {
          setMetricLoading(false);
        }
      }
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalNichos = ocupacion.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const ocupados =
      ocupacion.find((item) => item.estado === "Ocupado")?.total || 0;
    const disponibles =
      ocupacion.find((item) => item.estado === "Disponible")?.total || 0;
    const reservados =
      ocupacion.find((item) => item.estado === "Reservado")?.total || 0;

    const ocupacionPct =
      totalNichos > 0 ? Math.round((ocupados / totalNichos) * 100) : 0;

    return {
      totalNichos,
      ocupados,
      disponibles,
      reservados,
      ocupacionPct,
    };
  }, [ocupacion]);

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
        <h1>
          Gestión del Cementerio no.2 de la Municipalidad de San Antonio
          Suchitepéquez.
        </h1>
        <p>
          Administra nichos, propietarios, arrendamientos y reportes
          desde un solo panel moderno.
        </p>

        <div className="login-hero-cards">
          <div className="hero-card hero-card-primary">
            <span className="hero-card-label">Estado de ocupación</span>
            {metricLoading ? (
              <p className="hero-card-note">Cargando métricas...</p>
            ) : metricError && metrics.totalNichos === 0 ? (
              <p className="hero-card-note">{metricError}</p>
            ) : (
              <>
                <h2>{metrics.totalNichos} nichos</h2>
                <p>
                  {metrics.ocupacionPct}% ocupados · distribución actual de
                  nichos.
                </p>
                <div className="hero-stats">
                  {[
                    { label: "Ocupados", value: metrics.ocupados },
                    { label: "Reservados", value: metrics.reservados },
                    { label: "Disponibles", value: metrics.disponibles },
                  ].map((item) => (
                    <div key={item.label} className="hero-stats-item">
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="hero-card hero-card-soft">
            <span className="hero-card-label">Alertas</span>
            {metricLoading ? (
              <p className="hero-card-note">Cargando alertas...</p>
            ) : alertas.length > 0 ? (
              <>
                <h2>{alertas.length}</h2>
                <p>Arrendamientos por vencer en 30 días.</p>
              </>
            ) : (
              <>
                <h2>0</h2>
                <p>
                  {metricError
                    ? metricError
                    : "¡Excelente! No hay vencimientos próximos."}
                </p>
              </>
            )}
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
