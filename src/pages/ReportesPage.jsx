import React, { useEffect, useState } from "react";
import {
  getReporteOcupacion,
  getReporteArrendamientos,
  getReporteCartera,
} from "../api/reportes";

// --- PESTAÑA 1: OCUPACIÓN ---
function TabOcupacion() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReporteOcupacion().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-placeholder">Cargando gráfico...</div>;
  if (!data.length) return <div className="empty-state">No hay datos de ocupación.</div>;

  const total = data.reduce((acc, item) => acc + item.total, 0);

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ marginBottom: "20px" }}>Distribución de Nichos</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>
        {data.map((item) => {
          const porcentaje = total > 0 ? Math.round((item.total / total) * 100) : 0;
          // Colores según el estado
          let color = "#e5e7eb";
          if (item.estado === "Disponible") color = "#10b981"; // Verde
          if (item.estado === "Ocupado") color = "#ef4444"; // Rojo
          if (item.estado === "Reservado") color = "#f59e0b"; // Naranja

          return (
            <div key={item.estado}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
                <strong>{item.estado}</strong>
                <span>
                  {item.total} nichos ({porcentaje}%)
                </span>
              </div>
              <div style={{ width: "100%", height: "24px", backgroundColor: "#f3f4f6", borderRadius: "12px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${porcentaje}%`,
                    height: "100%",
                    backgroundColor: color,
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: "20px", color: "#6b7280", fontSize: "13px" }}>
        Total de nichos registrados: <strong>{total}</strong>
      </p>
    </div>
  );
}

// --- PESTAÑA 2: ARRENDAMIENTOS ---
function TabArrendamientos() {
  const [data, setData] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = () => {
    setLoading(true);
    getReporteArrendamientos(desde, hasta).then(setData).finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div>
      <div className="section-filters" style={{ marginTop: "16px" }}>
        <div className="filter-group">
          <label className="filter-label">
            Desde:{" "}
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label className="filter-label">
            Hasta:{" "}
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
          <button className="btn-outline" onClick={cargar} style={{ alignSelf: "flex-end" }}>
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-placeholder">Buscando...</div>
      ) : data.length === 0 ? (
        <div className="empty-state">Sin resultados.</div>
      ) : (
        <div className="data-table">
          <div className="data-table-header" style={{ gridTemplateColumns: "0.5fr 1.5fr 1fr 1fr" }}>
            <div>ID</div>
            <div>Propietario</div>
            <div>Nicho</div>
            <div>Fecha Inicio</div>
          </div>
          {data.map((a) => (
            <div key={a.id} className="data-table-row" style={{ gridTemplateColumns: "0.5fr 1.5fr 1fr 1fr" }}>
              <div>#{a.id}</div>
              <div>
                {a.nombres} {a.apellidos}
              </div>
              <div>Nicho {a.numero_nicho}</div>
              <div>{a.fecha_inicio ? a.fecha_inicio.substring(0, 10) : "-"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- PESTAÑA 3: CARTERA (MORA) ---
function TabCartera() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReporteCartera().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-placeholder">Calculando mora...</div>;
  if (!data.length) return <div className="empty-state">¡Excelente! No hay mora registrada.</div>;

  return (
    <div style={{ marginTop: "16px" }}>
      <div className="data-table">
        <div className="data-table-header" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr" }}>
          <div>Deudor</div>
          <div>Nicho</div>
          <div>Venció el</div>
          <div>Días de Mora</div>
        </div>
        {data.map((c, i) => (
          <div key={i} className="data-table-row" style={{ gridTemplateColumns: "1.5fr 1fr 1fr 1fr" }}>
            <div style={{ fontWeight: 600 }}>
              {c.nombres} {c.apellidos}
            </div>
            <div>Nicho {c.numero_nicho}</div>
            <div>{c.fecha_fin ? c.fecha_fin.substring(0, 10) : "-"}</div>
            <div style={{ color: "red", fontWeight: "bold" }}>{c.dias_mora} días</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
function ReportesPage() {
  const [activeTab, setActiveTab] = useState("ocupacion");

  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    border: "none",
    background: "transparent",
    borderBottom: activeTab === tabName ? "2px solid #4561db" : "none",
    color: activeTab === tabName ? "#4561db" : "#6b7280",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Reportes y Estadísticas</h2>
          <p>Información clave para la toma de decisiones.</p>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("ocupacion")} style={tabStyle("ocupacion")}>
          Ocupación
        </button>
        <button onClick={() => setActiveTab("arrendamientos")} style={tabStyle("arrendamientos")}>
          Arrendamientos
        </button>
        <button onClick={() => setActiveTab("cartera")} style={tabStyle("cartera")}>
          Cartera / Mora
        </button>
      </div>

      <div>
        {activeTab === "ocupacion" && <TabOcupacion />}
        {activeTab === "arrendamientos" && <TabArrendamientos />}
        {activeTab === "cartera" && <TabCartera />}
      </div>
    </div>
  );
}

export default ReportesPage;
