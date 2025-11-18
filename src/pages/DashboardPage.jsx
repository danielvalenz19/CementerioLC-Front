import React, { useEffect, useState } from "react";
import {
  getOcupacion,
  getAlertasVencimientos,
} from "../api/dashboard";

function DashboardPage() {
  const [ocupacion, setOcupacion] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [ocupacionRes, alertasRes] = await Promise.all([
          getOcupacion(),
          getAlertasVencimientos(),
        ]);

        setOcupacion(ocupacionRes || {});
        setAlertas(Array.isArray(alertasRes) ? alertasRes : []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalNichos = ocupacion?.total_nichos || 0;
  const totalOcupados = ocupacion?.total_ocupados || 0;
  const totalDisponibles = ocupacion?.total_disponibles || 0;

  const ocupacionPorc =
    totalNichos > 0
      ? ((totalOcupados / totalNichos) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Resumen general</h2>
          <p>Vista rápida de ocupación y vencimientos.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando dashboard...</div>
      ) : (
        <div className="dashboard-grid">
          {/* Card principal tipo gradient */}
          <div className="dash-card dash-card-primary">
            <span className="dash-card-label">Ocupación del cementerio</span>
            <div className="dash-card-main">
              <h3>{ocupacionPorc}%</h3>
              <p>
                {totalOcupados} de {totalNichos} nichos están ocupados.
              </p>
            </div>
            <div className="dash-card-footer">
              <span>Disponibles: {totalDisponibles}</span>
            </div>
          </div>

          {/* Card tipo calendario / resumen de arrendamientos */}
          <div className="dash-card dash-card-soft">
            <span className="dash-card-label">Estado de nichos</span>
            <div className="dash-stat-row">
              <div className="dash-stat">
                <span className="dash-stat-label">Ocupados</span>
                <span className="dash-stat-value">{totalOcupados}</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Disponibles</span>
                <span className="dash-stat-value">{totalDisponibles}</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat-label">Total</span>
                <span className="dash-stat-value">{totalNichos}</span>
              </div>
            </div>
            <p className="dash-muted">
              Estos datos vienen de <code>/api/reportes/ocupacion</code>.
            </p>
          </div>

          {/* Card de alertas */}
          <div className="dash-card">
            <span className="dash-card-label">Vencimientos próximos</span>

            {alertas.length === 0 ? (
              <p className="dash-muted">
                No hay arrendamientos por vencer en los próximos días.
              </p>
            ) : (
              <ul className="alert-list">
                {alertas.slice(0, 5).map((item, idx) => (
                  <li key={idx} className="alert-item">
                    <div>
                      <strong>{item.propietario || "Propietario"}</strong>
                      <p className="alert-sub">
                        Nicho {item.nicho || "-"} · Manzana{" "}
                        {item.manzana || "-"}
                      </p>
                    </div>
                    <span className="alert-date">
                      {item.fecha_vencimiento || item.fecha_fin || ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {alertas.length > 5 && (
              <p className="dash-muted">
                Y {alertas.length - 5} más...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
