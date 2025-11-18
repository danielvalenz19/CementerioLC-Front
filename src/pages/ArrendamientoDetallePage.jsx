import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getArrendamientoById,
  renovarArrendamiento,
  cancelarArrendamiento,
} from "../api/arrendamientos";

function getEstadoVirtualTagClass(estadoVirtual) {
  if (estadoVirtual === "Vigente") return "tag-vigente";
  if (estadoVirtual === "Vencido") return "tag-vencido";
  return "tag-default";
}

function getPropietarioNombre(a) {
  return (
    a.propietario_nombre ||
    a.propietario ||
    a.nombre_propietario ||
    "-"
  );
}

function getNichoLabel(a) {
  const num = a.nicho || a.nicho_numero || a.nichoId || a.nicho_id;
  const manzana = a.manzana || a.manzana_nombre;
  if (num && manzana) return `${manzana} · Nicho ${num}`;
  if (num) return `Nicho ${num}`;
  return "-";
}

function getDifuntoNombre(a) {
  return (
    a.nombre_difunto ||
    a.difunto ||
    a.nombre_difunto_actual ||
    "-"
  );
}

function ArrendamientoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [arr, setArr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionLoading, setAccionLoading] = useState(false);
  const [error, setError] = useState("");

  const [nuevaFechaFin, setNuevaFechaFin] = useState("");

  async function loadArrendamiento() {
    setLoading(true);
    setError("");

    try {
      const data = await getArrendamientoById(id);
      setArr(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el arrendamiento.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArrendamiento();
  }, [id]);

  const handleRenovar = async () => {
    if (!nuevaFechaFin) return;
    if (!window.confirm("¿Renovar este arrendamiento con la nueva fecha fin?")) {
      return;
    }

    setAccionLoading(true);
    setError("");

    try {
      await renovarArrendamiento(id, nuevaFechaFin);
      await loadArrendamiento();
    } catch (err) {
      console.error(err);
      setError("No se pudo renovar el arrendamiento.");
    } finally {
      setAccionLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!window.confirm("¿Cancelar este arrendamiento?")) return;

    setAccionLoading(true);
    setError("");

    try {
      await cancelarArrendamiento(id);
      await loadArrendamiento();
    } catch (err) {
      console.error(err);
      setError("No se pudo cancelar el arrendamiento.");
    } finally {
      setAccionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-placeholder">
        Cargando arrendamiento...
      </div>
    );
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }

  if (!arr) {
    return <div>No se encontró el arrendamiento.</div>;
  }

  const estadoVirtual = arr.estado_virtual || arr.estado;

  return (
    <div className="arr-page">
      <div className="section-header">
        <div>
          <h2>Arrendamiento #{arr.id}</h2>
          <p>Detalle completo del arrendamiento.</p>
        </div>
        <button
          className="btn-outline"
          onClick={() => navigate("/app/arrendamientos")}
        >
          Volver al listado
        </button>
      </div>

      <div className="arr-grid">
        <div className="arr-card">
          <div className="arr-card-header">
            <span className="arr-badge">Arrendamiento</span>
            <div className="arr-header-main">
              <span>{getNichoLabel(arr)}</span>
              <span>
                <span
                  className={`tag ${getEstadoVirtualTagClass(
                    estadoVirtual
                  )}`}
                >
                  {estadoVirtual}
                </span>
              </span>
            </div>
            <p className="arr-sub">
              Desde {arr.fecha_inicio || "N/D"} hasta {arr.fecha_fin || "N/D"}
            </p>
          </div>

          <div className="arr-rows">
            <div className="arr-row">
              <span>Propietario</span>
              <div>
                {arr.propietario_id ? (
                  <Link
                    to={`/app/propietarios/${arr.propietario_id}`}
                    className="arr-link"
                  >
                    {getPropietarioNombre(arr)}
                  </Link>
                ) : (
                  <strong>{getPropietarioNombre(arr)}</strong>
                )}
              </div>
            </div>

            <div className="arr-row">
              <span>ID Propietario</span>
              <strong>{arr.propietario_id || "-"}</strong>
            </div>

            <div className="arr-row">
              <span>ID Nicho</span>
              <strong>{arr.nicho_id || "-"}</strong>
            </div>

            <div className="arr-row">
              <span>Nombre del difunto</span>
              <strong>{getDifuntoNombre(arr)}</strong>
            </div>

            <div className="arr-row">
              <span>ID de recibo</span>
              <strong>{arr.recibo_id || "-"}</strong>
            </div>
          </div>

          <p className="dash-muted">
            El estado virtual (Vigente / Vencido) es calculado en el backend
            según la fecha_fin y la fecha actual.
          </p>
        </div>

        <div className="arr-card">
          <div className="arr-card-header">
            <span className="arr-badge arr-badge-soft">Acciones</span>
            <h4>Gestionar arrendamiento</h4>
          </div>

          <div className="arr-actions">
            <div>
              <h5>Renovar</h5>
              <p className="arr-sub">
                Define una nueva fecha de finalización para renovar el arrendamiento.
              </p>
              <label className="form-label">
                Nueva fecha fin
                <input
                  type="date"
                  value={nuevaFechaFin}
                  onChange={(e) => setNuevaFechaFin(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn-primary"
                disabled={accionLoading || !nuevaFechaFin}
                onClick={handleRenovar}
              >
                {accionLoading ? "Procesando..." : "Renovar arrendamiento"}
              </button>
            </div>

            <div>
              <h5>Cancelar</h5>
              <p className="arr-sub">
                Cancela el arrendamiento actual. Asegúrate de registrar el cambio.
              </p>
              <button
                type="button"
                className="btn-danger-ghost"
                disabled={accionLoading}
                onClick={handleCancelar}
              >
                {accionLoading ? "Procesando..." : "Cancelar arrendamiento"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArrendamientoDetallePage;
