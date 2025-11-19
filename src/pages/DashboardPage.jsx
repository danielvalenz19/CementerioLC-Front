import React, { useEffect, useMemo, useState } from "react";
import {
  getOcupacion,
  getAlertasVencimientos,
  getRecibosRecientes,
} from "../api/dashboard";

const moneyFormatter = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  maximumFractionDigits: 0,
});

function DonutChart({
  data,
  size = 200,
  strokeWidth = 32,
  centerLabel = "0%",
  centerSubtext = "Ocupación",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((acc, item) => acc + (item.value || 0), 0);

  let cumulative = 0;

  return (
    <div className="donut-chart">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Gráfico de ocupación"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#eceff5"
          strokeWidth={strokeWidth}
        />

        {total > 0 &&
          data.map((segment) => {
            const value = Math.max(0, segment.value || 0);
            const dash = (value / total) * circumference;
            const circle = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-cumulative}
                strokeLinecap="round"
              />
            );
            cumulative += dash;
            return circle;
          })}
      </svg>

      <div className="donut-center">
        <strong>{centerLabel}</strong>
        <span>{centerSubtext}</span>
      </div>

      <ul className="donut-legend">
        {data.map((segment) => {
          const pct =
            total > 0 ? Math.round((segment.value / total) * 100) : 0;
          return (
            <li key={segment.label}>
              <span
                className="legend-color"
                style={{ backgroundColor: segment.color }}
              />
              <div>
                <p>{segment.label}</p>
                <small>
                  {segment.value} nichos · {pct}%
                </small>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BarChart({ data }) {
  if (!data.length) {
    return <div className="empty-state">Sin pagos registrados.</div>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 0) || 1;

  return (
    <div className="bar-chart">
      {data.map((item) => {
        const height = Math.round((item.value / maxValue) * 100);
        return (
          <div key={item.label} className="bar-chart-item">
            <div className="bar-chart-bar" style={{ height: `${height}%` }}>
              <span>{moneyFormatter.format(item.value)}</span>
            </div>
            <strong>{item.label}</strong>
          </div>
        );
      })}
    </div>
  );
}

function DashboardPage() {
  const [ocupacion, setOcupacion] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [ocupacionRes, alertasRes, recibosRes] = await Promise.all([
        getOcupacion(),
        getAlertasVencimientos(),
        getRecibosRecientes(),
      ]);

      setOcupacion(Array.isArray(ocupacionRes) ? ocupacionRes : []);
      setAlertas(Array.isArray(alertasRes) ? alertasRes : []);
      setRecibos(Array.isArray(recibosRes) ? recibosRes : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
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

  const donutData = useMemo(
    () => [
      { label: "Ocupados", value: stats.ocupados, color: "#f97316" },
      { label: "Reservados", value: stats.reservados, color: "#fbbf24" },
      { label: "Disponibles", value: stats.disponibles, color: "#22c55e" },
    ],
    [stats.ocupados, stats.reservados, stats.disponibles]
  );

  const barData = useMemo(() => {
    return recibos.slice(0, 8).map((recibo) => {
      const monto = Number(recibo.monto) || 0;
      const fecha = recibo.fecha_pago || recibo.fecha || "";
      const label = fecha ? fecha.substring(5, 10) : `#${recibo.id}`;
      return { label, value: monto };
    });
  }, [recibos]);

  const ingresosRecientes = barData.reduce((sum, item) => sum + item.value, 0);

  const alertsPreview = alertas.slice(0, 6);

  const kpis = [
    {
      label: "Total de nichos",
      value: stats.totalNichos,
      detail: "Registrados en el sistema",
    },
    {
      label: "Ocupación",
      value: `${stats.ocupacionPct}%`,
      detail: `${stats.ocupados} ocupados`,
    },
    {
      label: "Alertas activas",
      value: alertas.length,
      detail: "Vencen en 30 días",
    },
    {
      label: "Ingresos recientes",
      value: moneyFormatter.format(ingresosRecientes),
      detail: "Últimos 10 recibos",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Tablero de Control</h2>
          <p>Monitorea la operación del cementerio en tiempo real.</p>
        </div>
        <button className="btn-outline" onClick={loadDashboard}>
          Actualizar datos
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando dashboard...</div>
      ) : (
        <>
          <div className="dashboard-kpis">
            {kpis.map((item) => (
              <div key={item.label} className="kpi-card">
                <span className="kpi-label">{item.label}</span>
                <strong className="kpi-value">{item.value}</strong>
                <span className="kpi-detail">{item.detail}</span>
              </div>
            ))}
          </div>

          <div className="chart-grid">
            <div className="dash-card chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="dash-card-label">Estado de ocupación</span>
                  <h3>Distribución de nichos</h3>
                </div>
              </div>
              <DonutChart
                data={donutData}
                centerLabel={`${stats.ocupacionPct}%`}
              />
            </div>

            <div className="dash-card chart-card">
              <div className="chart-card-header">
                <div>
                  <span className="dash-card-label">Ingresos recientes</span>
                  <h3>Últimos pagos registrados</h3>
                </div>
              </div>
              <BarChart data={barData} />
            </div>
          </div>

          <div className="dashboard-lists">
            <div className="dash-card alert-card">
              <div className="chart-card-header">
                <div>
                  <span className="dash-card-label">Alertas</span>
                  <h3>Arrendamientos por vencer</h3>
                </div>
                <span className="badge">{alertas.length}</span>
              </div>
              {alertsPreview.length === 0 ? (
                <p className="dash-muted">
                  ¡Excelente! No hay vencimientos próximos.
                </p>
              ) : (
                <ul className="alert-list">
                  {alertsPreview.map((alerta, idx) => (
                    <li key={`${alerta.arrendamiento_id}-${idx}`}>
                      <div>
                        <strong>
                          {alerta.nombres} {alerta.apellidos}
                        </strong>
                        <p className="alert-sub">
                          Nicho {alerta.numero_nicho} · Manzana{" "}
                          {alerta.manzana_id}
                        </p>
                      </div>
                      <div className="alert-meta">
                        <span className="badge badge-warning">
                          {alerta.dias_restantes} días
                        </span>
                        <small>
                          {alerta.fecha_fin
                            ? alerta.fecha_fin.substring(0, 10)
                            : "-"}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dash-card status-card">
              <div className="chart-card-header">
                <div>
                  <span className="dash-card-label">Detalle</span>
                  <h3>Resumen operativo</h3>
                </div>
              </div>
              <ul className="status-list">
                <li>
                  <span>Ocupados</span>
                  <strong>{stats.ocupados}</strong>
                </li>
                <li>
                  <span>Reservados</span>
                  <strong>{stats.reservados}</strong>
                </li>
                <li>
                  <span>Disponibles</span>
                  <strong>{stats.disponibles}</strong>
                </li>
                <li>
                  <span>Total de nichos</span>
                  <strong>{stats.totalNichos}</strong>
                </li>
                <li>
                  <span>Alertas monitoreadas</span>
                  <strong>{alertas.length}</strong>
                </li>
                <li>
                  <span>Últimos pagos</span>
                  <strong>{barData.length}</strong>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
