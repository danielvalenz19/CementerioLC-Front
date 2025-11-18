import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listSolicitudes, createSolicitud } from "../api/solicitudes";
import { fetchCatalogoPropietarios } from "../api/catalogosApi";
import { fetchNichosDisponibles } from "../api/nichosApi";
import Modal from "../components/common/Modal";

const ESTADOS = ["Todos", "Pendiente", "Aprobada", "Rechazada"];

function getEstadoTagClass(estado) {
  if (estado === "Pendiente") return "tag-pendiente";
  if (estado === "Aprobada") return "tag-aprobada";
  if (estado === "Rechazada") return "tag-rechazada";
  return "tag-default";
}

function getPropietarioNombre(s) {
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

function SolicitudesPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    estado: "Todos",
    propietarioId: "all",
    nichoId: "",
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [propietariosCat, setPropietariosCat] = useState([]);
  const [nichosDisponibles, setNichosDisponibles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    propietario_id: "",
    nicho_id: "",
  });

  useEffect(() => {
    async function loadCatalogos() {
      try {
        const [propCats, nichosDisp] = await Promise.all([
          fetchCatalogoPropietarios(),
          fetchNichosDisponibles(),
        ]);

        setPropietariosCat(Array.isArray(propCats) ? propCats : []);
        setNichosDisponibles(Array.isArray(nichosDisp) ? nichosDisp : []);
      } catch (err) {
        console.error("Error cargando catálogos para solicitudes", err);
      }
    }

    loadCatalogos();
  }, []);

  async function loadSolicitudes(customFilters) {
    const merged = { ...filters, ...(customFilters || {}) };
    setFilters(merged);

    setLoading(true);
    setError("");
    try {
      const items = await listSolicitudes({
        estado: merged.estado,
        propietarioId: merged.propietarioId,
        nichoId: merged.nichoId,
      });
      setSolicitudes(items);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las solicitudes.");
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    loadSolicitudes();
  };

  const clearFilters = () => {
    const reset = {
      estado: "Todos",
      propietarioId: "all",
      nichoId: "",
    };
    loadSolicitudes(reset);
  };

  const openCreateModal = () => {
    setFormData({
      propietario_id: "",
      nicho_id: "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSolicitud = async () => {
    if (!formData.propietario_id || !formData.nicho_id) return;

    setSaving(true);
    setError("");

    const payload = {
      propietario_id: Number(formData.propietario_id),
      nicho_id: Number(formData.nicho_id),
    };

    try {
      await createSolicitud(payload);
      setModalOpen(false);
      await loadSolicitudes();
    } catch (err) {
      console.error(err);
      setError("Error al crear la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  const goToDetalle = (s) => {
    navigate(`/app/solicitudes/${s.id}`);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Solicitudes de compra</h2>
          <p>Listado de solicitudes con filtros por estado, propietario y nicho.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Nueva solicitud
        </button>
      </div>

      <form className="section-filters" onSubmit={applyFilters}>
        <div className="filter-group">
          <label className="filter-label">
            Estado
            <select
              value={filters.estado}
              onChange={(e) =>
                handleFilterChange("estado", e.target.value)
              }
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-label">
            Propietario
            <select
              value={filters.propietarioId}
              onChange={(e) =>
                handleFilterChange("propietarioId", e.target.value)
              }
            >
              <option value="all">Todos</option>
              {propietariosCat.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_completo || p.nombre || p.label || `ID ${p.id}`}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-label">
            Nicho (ID)
            <input
              type="text"
              value={filters.nichoId}
              onChange={(e) =>
                handleFilterChange("nichoId", e.target.value)
              }
              placeholder="Ej. 12"
            />
          </label>
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn-outline">
            Aplicar filtros
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={clearFilters}
          >
            Limpiar
          </button>
        </div>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando solicitudes...</div>
      ) : solicitudes.length === 0 ? (
        <div className="empty-state">
          No se encontraron solicitudes con estos filtros.
        </div>
      ) : (
        <div className="data-table">
          <div className="data-table-header">
            <div>ID</div>
            <div>Fecha</div>
            <div>Propietario</div>
            <div>Nicho</div>
            <div>Estado</div>
            <div className="col-actions">Acciones</div>
          </div>
          {solicitudes.map((s) => (
            <div key={s.id} className="data-table-row">
              <div>{s.id}</div>
              <div>{s.fecha_solicitud || s.fecha || "-"}</div>
              <div>{getPropietarioNombre(s)}</div>
              <div>{getNichoLabel(s)}</div>
              <div>
                <span
                  className={`tag ${getEstadoTagClass(s.estado)}`}
                >
                  {s.estado || "N/D"}
                </span>
              </div>
              <div className="col-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => goToDetalle(s)}
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="Nueva solicitud de compra"
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        footer={
          <>
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                if (!saving) setModalOpen(false);
              }}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={
                saving ||
                !formData.propietario_id ||
                !formData.nicho_id
              }
              onClick={handleSaveSolicitud}
            >
              {saving ? "Guardando..." : "Crear solicitud"}
            </button>
          </>
        }
      >
        <label className="form-label">
          Propietario
          <select
            value={formData.propietario_id}
            onChange={(e) =>
              handleFormChange("propietario_id", e.target.value)
            }
          >
            <option value="">Selecciona un propietario...</option>
            {propietariosCat.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_completo || p.nombre || p.label || `ID ${p.id}`}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Nicho disponible
          <select
            value={formData.nicho_id}
            onChange={(e) =>
              handleFormChange("nicho_id", e.target.value)
            }
          >
            <option value="">Selecciona un nicho...</option>
            {nichosDisponibles.map((n) => (
              <option key={n.id} value={n.id}>
                {n.manzana || n.manzana_nombre || "Manzana ?"} · Nicho {" "}
                {n.numero || n.nicho || n.id}
              </option>
            ))}
          </select>
        </label>
      </Modal>
    </div>
  );
}

export default SolicitudesPage;
