import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPropietarioById,
  getArrendamientosByPropietario,
  getSolicitudesByPropietario,
  getTraspasosByPropietario,
} from "../api/propietarios";

function getNombre(p) {
  return (
    p?.nombre_completo ||
    p?.nombre ||
    [p?.nombres, p?.apellidos].filter(Boolean).join(" ") ||
    "-"
  );
}

function PropietarioDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [propietario, setPropietario] = useState(null);
  const [arrendamientos, setArrendamientos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [traspasos, setTraspasos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError("");

      try {
        const [p, arr, sol, tra] = await Promise.all([
          getPropietarioById(id),
          getArrendamientosByPropietario(id),
          getSolicitudesByPropietario(id),
          getTraspasosByPropietario(id),
        ]);

        setPropietario(p || null);
        setArrendamientos(Array.isArray(arr) ? arr : []);
        setSolicitudes(Array.isArray(sol) ? sol : []);
        setTraspasos(Array.isArray(tra) ? tra : []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del propietario.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id]);

  if (loading) {
    return <div className="loading-placeholder">Cargando propietario...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  if (!propietario) {
    return <div>No se encontró el propietario solicitado.</div>;
  }

  return (
    <div className="owner-page">
      <div className="section-header">
        <div>
          <h2>Propietario</h2>
          <p>Detalle del propietario y su historial de nichos.</p>
        </div>
        <button
          className="btn-outline"
          onClick={() => navigate("/app/propietarios")}
        >
          Volver al listado
        </button>
      </div>

      <div className="owner-grid">
        {/* Datos principales del propietario */}
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-badge">Propietario</span>
            <h3>{getNombre(propietario)}</h3>
            <p className="owner-sub">
              ID #{propietario.id} · DPI {propietario.dpi || "N/D"}
            </p>
          </div>

          <div className="owner-data-rows">
            <div className="owner-row">
              <span>Teléfono</span>
              <strong>
                {propietario.telefono ||
                  propietario.celular ||
                  propietario.telefono1 ||
                  "-"}
              </strong>
            </div>
            <div className="owner-row">
              <span>Dirección</span>
              <strong>
                {propietario.direccion ||
                  propietario.domicilio ||
                  "Sin dirección registrada"}
              </strong>
            </div>
            <div className="owner-row">
              <span>Correo</span>
              <strong>{propietario.correo || "-"}</strong>
            </div>
          </div>

          <p className="dash-muted">
            Desde aquí puedes revisar todos los nichos, arrendamientos,
            solicitudes y traspasos asociados a este propietario.
          </p>
        </div>

        {/* Arrendamientos */}
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-badge owner-badge-soft">
              Arrendamientos
            </span>
            <h4>Historial de arrendamientos</h4>
          </div>

          {arrendamientos.length === 0 ? (
            <p className="owner-empty">
              Este propietario no tiene arrendamientos registrados.
            </p>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Nicho</th>
                  <th>Manzana</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {arrendamientos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nicho || a.nicho_numero || "-"}</td>
                    <td>{a.manzana || a.manzana_nombre || "-"}</td>
                    <td>{a.fecha_inicio || a.fecha_inicio_arr || "-"}</td>
                    <td>{a.fecha_fin || a.fecha_vencimiento || "-"}</td>
                    <td>{a.estado || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Segunda fila: Solicitudes + Traspasos */}
      <div className="owner-grid owner-grid-bottom">
        {/* Solicitudes */}
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-badge owner-badge-soft">
              Solicitudes
            </span>
            <h4>Solicitudes relacionadas</h4>
          </div>

          {solicitudes.length === 0 ? (
            <p className="owner-empty">
              No se encontraron solicitudes para este propietario.
            </p>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nicho</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.nicho || s.nicho_numero || "-"}</td>
                    <td>{s.fecha_solicitud || s.fecha || "-"}</td>
                    <td>{s.estado || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Traspasos */}
        <div className="owner-card">
          <div className="owner-card-header">
            <span className="owner-badge owner-badge-soft">
              Traspasos
            </span>
            <h4>Traspasos donde participa</h4>
          </div>

          {traspasos.length === 0 ? (
            <p className="owner-empty">
              No se encontraron traspasos asociados a este propietario.
            </p>
          ) : (
            <table className="owner-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nicho origen</th>
                  <th>Nicho destino</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {traspasos.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.nicho_origen || t.nicho_origen_num || "-"}</td>
                    <td>{t.nicho_destino || t.nicho_destino_num || "-"}</td>
                    <td>{t.fecha_traspaso || t.fecha || "-"}</td>
                    <td>{t.estado || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}

export default PropietarioDetallePage;
