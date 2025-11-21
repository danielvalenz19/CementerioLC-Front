import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../api/solicitudes";

function getEstadoTagClass(estado) {
  if (estado === "Pendiente") return "tag-pendiente";
  if (estado === "Aprobada") return "tag-aprobada";
  if (estado === "Rechazada") return "tag-rechazada";
  return "tag-default";
}

// CORREGIDO: Ahora busca nombres y apellidos para que no salga el guion "-"
function getPropietarioNombre(s) {
  if (s.nombres || s.apellidos) {
    return `${s.nombres || ""} ${s.apellidos || ""}`.trim();
  }
  return (
    s.propietario_nombre ||
    s.propietario ||
    s.nombre_propietario ||
    "-"
  );
}

function getNichoLabel(s) {
  const num = s.nicho || s.nicho_numero || s.nichoId || s.nicho_id;
  const manzana = s.manzana || s.manzana_nombre;
  if (num && manzana) return `${manzana} · Nicho ${num}`;
  if (num) return `Nicho ${num}`;
  return "-";
}

function SolicitudDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [error, setError] = useState("");

  const [reciboId, setReciboId] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");

  async function loadSolicitud() {
    setLoading(true);
    setError("");
    try {
      const data = await getSolicitudById(id);
      setSolicitud(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSolicitud();
  }, [id]);

  const estaPendiente = solicitud?.estado === "Pendiente";

  const handleAprobar = async () => {
    if (!window.confirm("¿Aprobar esta solicitud?")) return;
    setAccionLoading(true);
    setError("");

    try {
      await aprobarSolicitud(id, reciboId);
      await loadSolicitud();
    } catch (err) {
      console.error(err);
      setError("No se pudo aprobar la solicitud.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!window.confirm("¿Rechazar esta solicitud?")) return;

    setAccionLoading(true);
    setError("");
    try {
      await rechazarSolicitud(id);
      console.log("Motivo de rechazo:", motivoRechazo);
      await loadSolicitud();
    } catch (err) {
      console.error(err);
      setError("No se pudo rechazar la solicitud.");
    } finally {
      setAccionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-placeholder">Cargando solicitud...</div>;
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  if (!solicitud) {
    return <div>No se encontró la solicitud.</div>;
  }

  return (
    <div className="sol-page">
      <div className="section-header">
        <div>
          <h2>Solicitud #{solicitud.id}</h2>
          <p>Detalle de la solicitud de compra de nicho.</p>
        </div>
        <button
          className="btn-outline"
          onClick={() => navigate("/app/solicitudes")}
        >
          Volver al listado
        </button>
      </div>

      <div className="sol-grid">
        <div className="sol-card">
          <div className="sol-card-header">
            <span className="sol-badge">Solicitud de compra</span>
            <div className="sol-header-main">
              <span>Solicitud #{solicitud.id}</span>
              <span>
                <span
                  className={`tag ${getEstadoTagClass(solicitud.estado)}`}
                >
                  {solicitud.estado}
                </span>
              </span>
            </div>
            <p className="sol-sub">
              Fecha: {solicitud.fecha_solicitud || solicitud.fecha || "N/D"}
            </p>
          </div>

          <div className="sol-rows">
            <div className="sol-row">
              <span>Propietario</span>
              <div>
                {solicitud.propietario_id ? (
                  <Link
                    to={`/app/propietarios/${solicitud.propietario_id}`}
                    className="sol-link"
                  >
                    {getPropietarioNombre(solicitud)}
                  </Link>
                ) : (
                  <strong>{getPropietarioNombre(solicitud)}</strong>
                )}
              </div>
            </div>

            <div className="sol-row">
              <span>Nicho solicitado</span>
              <strong>{getNichoLabel(solicitud)}</strong>
            </div>
            
            {/* IDs eliminados para limpiar la vista */}
          </div>
          
          {/* Texto eliminado */}
        </div>

        <div className="sol-card">
          <div className="sol-card-header">
            <span className="sol-badge sol-badge-soft">Acciones</span>
            <h4>Resolver solicitud</h4>
          </div>

          {!estaPendiente ? (
            <p className="sol-info">
              Esta solicitud ya fue <strong>{solicitud.estado}</strong>. No se
              pueden realizar más acciones.
            </p>
          ) : (
            <div className="sol-actions">
              <div>
                <h5>Aprobar</h5>
                <p className="sol-sub">
                  Puedes asociar un <strong>recibo</strong> de pago si lo deseas.
                </p>
                <label className="form-label">
                  ID de recibo (opcional)
                  <input
                    type="text"
                    value={reciboId}
                    onChange={(e) => setReciboId(e.target.value)}
                    placeholder="Ej. REC-00123"
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={accionLoading}
                  onClick={handleAprobar}
                >
                  {accionLoading ? "Procesando..." : "Aprobar solicitud"}
                </button>
              </div>

              <div>
                <h5>Rechazar</h5>
                <p className="sol-sub">
                  El motivo solo se guarda a nivel de interfaz.
                </p>
                <label className="form-label">
                  Motivo del rechazo (opcional)
                  <input
                    type="text"
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Ej. Documentos incompletos"
                  />
                </label>
                <button
                  type="button"
                  className="btn-danger-ghost"
                  disabled={accionLoading}
                  onClick={handleRechazar}
                >
                  {accionLoading ? "Procesando..." : "Rechazar solicitud"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SolicitudDetallePage;
