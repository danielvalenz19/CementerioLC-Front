import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listArrendamientos,
  createArrendamiento,
} from "../api/arrendamientos";
import { fetchCatalogoPropietarios } from "../api/catalogosApi";
import { fetchNichosDisponibles } from "../api/nichosApi";
import Modal from "../components/common/Modal";

const ESTADOS = ["Todos", "Vigente", "Vencido"];

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

function ArrendamientosPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    estado: "Todos",
    propietarioId: "all",
    nichoId: "",
  });

  const [arrendamientos, setArrendamientos] = useState([]);
  const [propietariosCat, setPropietariosCat] = useState([]);
  const [nichosDisponibles, setNichosDisponibles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    propietario_id: "",
    nicho_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    nombre_difunto: "",
    recibo_id: "",
  });

  // Catálogos
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
        console.error("Error cargando catálogos para arrendamientos", err);
      }
    }

    loadCatalogos();
  }, []);

  // Listado
  async function loadArrendamientos(customFilters) {
    const merged = { ...filters, ...(customFilters || {}) };
    setFilters(merged);

    setLoading(true);
    setError("");

    try {
      const items = await listArrendamientos({
        estado: merged.estado,
        propietarioId: merged.propietarioId,
        nichoId: merged.nichoId,
      });
      setArrendamientos(items);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los arrendamientos.");
      setArrendamientos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArrendamientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    loadArrendamientos();
  };

  const clearFilters = () => {
    const reset = {
      estado: "Todos",
      propietarioId: "all",
      nichoId: "",
    };
    loadArrendamientos(reset);
  };

  const openCreateModal = () => {
    setFormData({
      propietario_id: "",
      nicho_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      nombre_difunto: "",
      recibo_id: "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveArrendamiento = async () => {
    if (
      !formData.propietario_id ||
      !formData.nicho_id ||
      !formData.fecha_inicio ||
      !formData.fecha_fin
    ) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      propietario_id: Number(formData.propietario_id),
      nicho_id: Number(formData.nicho_id),
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      nombre_difunto: formData.nombre_difunto || null,
      recibo_id: formData.recibo_id || null,
    };

    try {
      await createArrendamiento(payload);
      setModalOpen(false);
      await loadArrendamientos();
    } catch (err) {
      console.error(err);
      setError("Error al crear el arrendamiento.");
    } finally {
      setSaving(false);
    }
  };

  const goToDetalle = (a) => {
    navigate(`/app/arrendamientos/${a.id}`);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Arrendamientos</h2>
          <p>
            Listado de arrendamientos con filtros por estado, propietario y nicho.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Nuevo arrendamiento
        </button>
      </div>

      <form className="section-filters" onSubmit={applyFilters}>
        <div className="filter-group">
          <label className="filter-label">
            Estado
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange("estado", e.target.value)}
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
        <div className="loading-placeholder">
          Cargando arrendamientos...
        </div>
      ) : arrendamientos.length === 0 ? (
        <div className="empty-state">
          No se encontraron arrendamientos con estos filtros.
        </div>
      ) : (
        <div className="data-table data-table-arrendamientos">
          <div className="data-table-header">
            <div>Propietario</div>
            <div>Nicho</div>
            <div>Fecha inicio</div>
            <div>Fecha fin</div>
            <div>Estado</div>
            <div>Difunto</div>
            <div className="col-actions">Acciones</div>
          </div>
          {arrendamientos.map((a) => (
            <div key={a.id} className="data-table-row">
              <div>{getPropietarioNombre(a)}</div>
              <div>{getNichoLabel(a)}</div>
              <div>{a.fecha_inicio || "-"}</div>
              <div>{a.fecha_fin || "-"}</div>
              <div>
                <span
                  className={`tag ${getEstadoVirtualTagClass(
                    a.estado_virtual || a.estado
                  )}`}
                >
                  {a.estado_virtual || a.estado || "N/D"}
                </span>
              </div>
              <div>{getDifuntoNombre(a)}</div>
              <div className="col-actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => goToDetalle(a)}
                >
                  Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title="Nuevo arrendamiento"
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
                !formData.nicho_id ||
                !formData.fecha_inicio ||
                !formData.fecha_fin
              }
              onClick={handleSaveArrendamiento}
            >
              {saving ? "Guardando..." : "Crear arrendamiento"}
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
          Nicho
          <select
            value={formData.nicho_id}
            onChange={(e) => handleFormChange("nicho_id", e.target.value)}
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

        <div className="form-grid">
          <label className="form-label">
            Fecha inicio
            <input
              type="date"
              value={formData.fecha_inicio}
              onChange={(e) =>
                handleFormChange("fecha_inicio", e.target.value)
              }
            />
          </label>

          <label className="form-label">
            Fecha fin
            <input
              type="date"
              value={formData.fecha_fin}
              onChange={(e) => handleFormChange("fecha_fin", e.target.value)}
            />
          </label>
        </div>

        <label className="form-label">
          Nombre del difunto
          <input
            type="text"
            value={formData.nombre_difunto}
            onChange={(e) =>
              handleFormChange("nombre_difunto", e.target.value)
            }
            placeholder="Nombre del difunto"
          />
        </label>

        <label className="form-label">
          ID de recibo (opcional)
          <input
            type="text"
            value={formData.recibo_id}
            onChange={(e) =>
              handleFormChange("recibo_id", e.target.value)
            }
            placeholder="Ej. REC-00123"
          />
        </label>
      </Modal>
    </div>
  );
}

export default ArrendamientosPage;
