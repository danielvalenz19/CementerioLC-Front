import React, { useEffect, useState } from "react";
import {
  listNichos,
  createNicho,
  updateNicho,
  deleteNicho,
} from "../api/nichos";
import { getCatalogoManzanas } from "../api/catalogos";
import Modal from "../components/common/Modal";

const ESTADOS = ["Disponible", "Reservado", "Ocupado"];

function NichosPage() {
  const [nichos, setNichos] = useState([]);
  const [manzanas, setManzanas] = useState([]);
  const [filters, setFilters] = useState({
    manzanaId: "",
    estado: "",
    q: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const [selectedNicho, setSelectedNicho] = useState(null); // para panel de detalle

  // Campos del formulario de creación/edición
  const [formData, setFormData] = useState({
    manzana_id: "",
    numero: "",
    estado: "Disponible",
    nombre_difunto: "",
  });

  async function loadManzanas() {
    try {
      const data = await getCatalogoManzanas();
      setManzanas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      // no reventamos la página si falla catálogo
    }
  }

  async function loadNichos() {
    setLoading(true);
    setError("");
    try {
      const data = await listNichos(filters);
      setNichos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los nichos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManzanas();
    loadNichos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    loadNichos();
  };

  const resetFilters = () => {
    setFilters({ manzanaId: "", estado: "", q: "" });
    loadNichos();
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData({
      manzana_id: "",
      numero: "",
      estado: "Disponible",
      nombre_difunto: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (n) => {
    setEditing(n);

    setFormData({
      manzana_id: n.manzana_id || n.manzanaId || "",
      numero: n.numero || n.num || "",
      estado: n.estado || "Disponible",
      nombre_difunto:
        n.nombre_difunto || n.difunto || n.nombre_difunto_actual || "",
    });

    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.manzana_id || !formData.numero || !formData.estado) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      manzana_id: formData.manzana_id,
      numero: formData.numero,
      estado: formData.estado,
      nombre_difunto: formData.nombre_difunto || null,
    };

    try {
      if (editing?.id) {
        await updateNicho(editing.id, payload);
      } else {
        await createNicho(payload);
      }

      setModalOpen(false);
      setEditing(null);
      await loadNichos();
    } catch (err) {
      console.error(err);
      setError("Error al guardar el nicho. Revisa los datos.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (n) => {
    if (
      !window.confirm(
        `¿Eliminar el nicho ${n.numero || n.id}? Si hay arrendamientos asociados, fallará.`
      )
    ) {
      return;
    }

    setError("");
    try {
      await deleteNicho(n.id);
      if (selectedNicho?.id === n.id) {
        setSelectedNicho(null);
      }
      await loadNichos();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo eliminar el nicho. Puede que tenga arrendamientos/solicitudes asociados."
      );
    }
  };

  const getManzanaNombre = (n) => {
    return (
      n.manzana_nombre ||
      n.manzana ||
      n.nombre_manzana ||
      manzanas.find((m) => m.id === n.manzana_id)?.nombre ||
      "-"
    );
  };

  const getPropietarioNombre = (n) => {
    return (
      n.propietario ||
      n.propietario_nombre ||
      n.nombre_propietario ||
      "-"
    );
  };

  const getDifuntoNombre = (n) => {
    return (
      n.nombre_difunto ||
      n.difunto ||
      n.nombre_difunto_actual ||
      "-"
    );
  };

  return (
    <div className="nicho-layout">
      <div className="nicho-main">
        <div className="section-header">
          <div>
            <h2>Nichos</h2>
            <p>Listado de nichos con filtros por manzana y estado.</p>
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            Nuevo nicho
          </button>
        </div>

        <form className="section-filters" onSubmit={applyFilters}>
          <div className="filter-group">
            <label className="filter-label">
              Manzana
              <select
                value={filters.manzanaId}
                onChange={(e) =>
                  handleFilterChange("manzanaId", e.target.value)
                }
              >
                <option value="">Todas</option>
                {manzanas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Estado
              <select
                value={filters.estado}
                onChange={(e) =>
                  handleFilterChange("estado", e.target.value)
                }
              >
                <option value="">Todos</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Buscar
              <input
                type="text"
                value={filters.q}
                onChange={(e) =>
                  handleFilterChange("q", e.target.value)
                }
                placeholder="Número de nicho, texto..."
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
              onClick={resetFilters}
            >
              Limpiar
            </button>
          </div>
        </form>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <div className="loading-placeholder">Cargando nichos...</div>
        ) : nichos.length === 0 ? (
          <div className="empty-state">
            No se encontraron nichos con estos filtros.
          </div>
        ) : (
          <div className="data-table">
            <div className="data-table-header">
              <div>Manzana</div>
              <div>N° Nicho</div>
              <div>Estado</div>
              <div>Propietario</div>
              <div>Difunto</div>
              <div className="col-actions">Acciones</div>
            </div>
            {nichos.map((n) => (
              <div key={n.id} className="data-table-row">
                <div>{getManzanaNombre(n)}</div>
                <div>{n.numero || n.num || n.id}</div>
                <div>
                  <span
                    className={`tag tag-${
                      (n.estado || "").toLowerCase() || "default"
                    }`}
                  >
                    {n.estado || "N/D"}
                  </span>
                </div>
                <div>{getPropietarioNombre(n)}</div>
                <div>{getDifuntoNombre(n)}</div>
                <div className="col-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setSelectedNicho(n)}
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => openEditModal(n)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-danger-ghost"
                    onClick={() => handleDelete(n)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel lateral de detalle */}
      <aside className="nicho-detail-pane">
        {selectedNicho ? (
          <>
            <div className="detail-header">
              <h3>Nicho {selectedNicho.numero || selectedNicho.id}</h3>
              <button
                className="btn-ghost"
                onClick={() => setSelectedNicho(null)}
              >
                Cerrar
              </button>
            </div>

            <div className="detail-section">
              <span className="detail-label">Manzana</span>
              <strong>{getManzanaNombre(selectedNicho)}</strong>
            </div>

            <div className="detail-section">
              <span className="detail-label">Estado</span>
              <span
                className={`tag tag-${
                  (selectedNicho.estado || "").toLowerCase() || "default"
                }`}
              >
                {selectedNicho.estado || "N/D"}
              </span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Propietario actual</span>
              <strong>{getPropietarioNombre(selectedNicho)}</strong>
            </div>

            <div className="detail-section">
              <span className="detail-label">Nombre del difunto</span>
              <strong>{getDifuntoNombre(selectedNicho)}</strong>
            </div>

            <p className="dash-muted">
              Aquí luego se puede mostrar el historial de arrendamientos y
              traspasos consumiendo los endpoints correspondientes.
            </p>
          </>
        ) : (
          <div className="detail-empty">
            <h3>Detalle del nicho</h3>
            <p>
              Selecciona un nicho en la tabla para ver su información.
            </p>
          </div>
        )}
      </aside>

      <Modal
        title={editing ? "Editar nicho" : "Nuevo nicho"}
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditing(null);
          }
        }}
        footer={
          <>
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                if (!saving) {
                  setModalOpen(false);
                  setEditing(null);
                }
              }}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={
                saving ||
                !formData.manzana_id ||
                !formData.numero ||
                !formData.estado
              }
              onClick={handleSave}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="form-label">
            Manzana
            <select
              value={formData.manzana_id}
              onChange={(e) =>
                handleFormChange("manzana_id", e.target.value)
              }
            >
              <option value="">Selecciona...</option>
              {manzanas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            Número de nicho
            <input
              type="text"
              value={formData.numero}
              onChange={(e) =>
                handleFormChange("numero", e.target.value)
              }
              placeholder="Ej. 15"
            />
          </label>
        </div>

        <label className="form-label">
          Estado
          <select
            value={formData.estado}
            onChange={(e) =>
              handleFormChange("estado", e.target.value)
            }
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Nombre del difunto (opcional)
          <input
            type="text"
            value={formData.nombre_difunto}
            onChange={(e) =>
              handleFormChange("nombre_difunto", e.target.value)
            }
            placeholder="Nombre del difunto"
          />
        </label>
      </Modal>
    </div>
  );
}

export default NichosPage;
