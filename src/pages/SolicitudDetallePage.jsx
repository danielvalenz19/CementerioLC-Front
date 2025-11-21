import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getSolicitudById,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../api/solicitudes";

function getEstadoLabel(estado) {
  if (estado === "Pendiente") return "En Trámite";
  return estado;
}

function getEstadoTagClass(estado) {
  if (estado === "Pendiente") return "tag-pendiente";
  if (estado === "Aprobada") return "tag-aprobada";
  if (estado === "Rechazada") return "tag-rechazada";
  return "tag-default";
}

function getPropietarioNombre(s) {
  if (s.nombres || s.apellidos) {
    return `${s.nombres || ""} ${s.apellidos || ""}`.trim();
  }
  return s.propietario_nombre || s.propietario || "-";
}

function getNichoLabel(s) {
  const num = s.nicho || s.nicho_numero || s.numero_nicho;
  const manzana =
    s.manzana || s.manzana_nombre || (s.manzana_id ? `${s.manzana_id}` : "");
  const manzanaDisplay = manzana
    ? `Manzana ${manzana}`
    : `Manzana ID ${s.manzana_id || "?"}`;

  if (num) return `${manzanaDisplay} - Nicho #${num}`;
  return "Nicho no identificado";
}

function SolicitudDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [error, setError] = useState("");
  const [numeroRecibo, setNumeroRecibo] = useState("");
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
    if (
      !window.confirm(
        "¿Aprobar esta solicitud? El nicho pasará a estado OCUPADO."
      )
    ) {
      return;
    }

    setAccionLoading(true);
    setError("");

    try {
      await aprobarSolicitud(id, numeroRecibo);
      alert("Solicitud aprobada y nicho actualizado correctamente.");
      await loadSolicitud();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "No se pudo aprobar la solicitud.");
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
          <p>Detalle de la solicitud de compra.</p>
        </div>
        <button className="btn-outline" onClick={() => navigate("/app/solicitudes")}>
          Volver al listado
        </button>
      </div>

      <div className="sol-grid">
        <div className="sol-card">
          <div className="sol-card-header">
            <span className="sol-badge">Solicitud de compra</span>
            <div className="sol-header-main">
              <span>{getNichoLabel(solicitud)}</span>
              <span className={`tag ${getEstadoTagClass(solicitud.estado)}`}>
                {getEstadoLabel(solicitud.estado)}
              </span>
            </div>
            <p className="sol-sub">
              Fecha solicitud: {solicitud.fecha_solicitud || solicitud.fecha || "N/D"}
            </p>
          </div>

          <div className="sol-rows">
            <div className="sol-row">
              <span>Solicitante / Propietario</span>
              <div>
                {solicitud.propietario_id ? (
                  <Link to={`/app/propietarios/${solicitud.propietario_id}`} className="sol-link">
                    {getPropietarioNombre(solicitud)}
                  </Link>
                ) : (
                  <strong>{getPropietarioNombre(solicitud)}</strong>
                )}
              </div>
            </div>

            <div className="sol-row">
              <span>Ubicación exacta</span>
              <strong>{getNichoLabel(solicitud)}</strong>
            </div>

            {solicitud.recibo_id && (
              <div className="sol-row">
                <span>Recibo vinculado</span>
                <strong>
                  {solicitud.numero_recibo || `ID: ${solicitud.recibo_id}`}
                </strong>
              </div>
            )}
          </div>
        </div>

        <div className="sol-card">
          <div className="sol-card-header">
            <span className="sol-badge sol-badge-soft">Acciones</span>
            <h4>Resolver solicitud</h4>
          </div>

          {!estaPendiente ? (
            <p className="sol-info">
              Esta solicitud está{" "}
              <strong>{getEstadoLabel(solicitud.estado).toUpperCase()}</strong>.
              {solicitud.estado === "Aprobada" &&
                " El nicho ha sido marcado como ocupado."}
            </p>
          ) : (
            <div className="sol-actions">
              <div
                style={{ borderBottom: "1px solid #eee", paddingBottom: "16px" }}
              >
                <h5 style={{ color: "#166534", margin: "0 0 8px 0" }}>
                  Opción A: Aprobar
                </h5>
                <p className="sol-sub" style={{ marginBottom: "10px" }}>
                  Ingresa el número del recibo de pago para finalizar.
                </p>
                <label className="form-label">
                  Número de Recibo (Ej. A-1045)
                  <input
                    type="text"
                    value={numeroRecibo}
                    onChange={(e) => setNumeroRecibo(e.target.value)}
                    placeholder="Escribe el N° de recibo..."
                    style={{ borderColor: "#bbf7d0" }}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={accionLoading}
                  onClick={handleAprobar}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  {accionLoading ? "Procesando..." : "✓ Aprobar y Asignar Nicho"}
                </button>
              </div>

              <div>
                <h5 style={{ color: "#b91c1c", margin: "0 0 8px 0" }}>
                  Opción B: Rechazar
                </h5>
                <button
                  type="button"
                  className="btn-danger-ghost"
                  disabled={accionLoading}
                  onClick={handleRechazar}
                  style={{ width: "100%" }}
                >
                  {accionLoading ? "Procesando..." : "✗ Rechazar Solicitud"}
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
