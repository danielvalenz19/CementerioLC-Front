import React, { useEffect, useState } from "react";
import {
  listPropietarios,
  createPropietario,
  updatePropietario,
  deletePropietario,
} from "../api/propietarios";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";

function getNombre(p) {
  return (
    p.nombre_completo ||
    p.nombre ||
    [p.nombres, p.apellidos].filter(Boolean).join(" ") ||
    "-"
  );
}

function getTelefono(p) {
  return p.telefono || p.celular || p.telefono1 || "-";
}

function getDireccion(p) {
  return p.direccion || p.domicilio || "-";
}

function PropietariosPage() {
  const navigate = useNavigate();

  const [propietarios, setPropietarios] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    dpi: "",
    telefono: "",
    direccion: "",
  });
  const propietariosPagination = usePagination(propietarios);

  async function loadPropietarios() {
    setLoading(true);
    setError("");
    try {
      const items = await listPropietarios(search);
      setPropietarios(items);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los propietarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPropietarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPropietarios();
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData({
      nombre_completo: "",
      dpi: "",
      telefono: "",
      direccion: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditing(p);
    setFormData({
      nombre_completo: p.nombre_completo || p.nombre || "",
      dpi: p.dpi || "",
      telefono: p.telefono || p.celular || "",
      direccion: p.direccion || p.domicilio || "",
    });
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.nombre_completo.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    setError("");

    const nombreStr = formData.nombre_completo.trim();
    const primerEspacio = nombreStr.indexOf(" ");
    let nombresEnvio = "";
    let apellidosEnvio = "";

    if (primerEspacio === -1) {
      nombresEnvio = nombreStr;
      apellidosEnvio = "(Sin apellido)";
    } else {
      nombresEnvio = nombreStr.substring(0, primerEspacio);
      apellidosEnvio = nombreStr.substring(primerEspacio + 1);
    }

    const payload = {
      nombres: nombresEnvio,
      apellidos: apellidosEnvio,
      dpi: formData.dpi.trim(),
      telefono: formData.telefono.trim() || null,
      direccion: formData.direccion.trim() || null,
    };

    try {
      if (editing?.id) {
        await updatePropietario(editing.id, payload);
      } else {
        await createPropietario(payload);
      }

      setModalOpen(false);
      setEditing(null);
      setFormData({
        nombre_completo: "",
        dpi: "",
        telefono: "",
        direccion: "",
      });
      await loadPropietarios();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message ||
        "Error al guardar el propietario.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (
      !window.confirm(
        `¿Eliminar al propietario "${getNombre(
          p
        )}"? Si tiene arrendamientos, el backend podría rechazarlo.`
      )
    ) {
      return;
    }

    setError("");
    try {
      await deletePropietario(p.id);
      await loadPropietarios();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo eliminar el propietario. Puede que tenga nichos asociados."
      );
    }
  };

  const goToDetail = (p) => {
    navigate(`/app/propietarios/${p.id}`);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Propietarios</h2>
          <p>Listado de propietarios con búsqueda y edición rápida.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Nuevo propietario
        </button>
      </div>

      <form className="section-filters" onSubmit={handleSearchSubmit}>
        <div className="filter-group">
          <label className="filter-label">
            Buscar por nombre o DPI
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ej. Juan Pérez o 1234567890101"
            />
          </label>
        </div>
        <button type="submit" className="btn-outline">
          Buscar
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">
          Cargando propietarios...
        </div>
      ) : propietarios.length === 0 ? (
        <div className="empty-state">
          No se encontraron propietarios con este criterio.
        </div>
      ) : (
        <>
          <div className="data-table">
            <div className="data-table-header">
              <div>Nombre completo</div>
              <div>DPI</div>
              <div>Teléfono</div>
              <div>Dirección</div>
              <div className="col-actions">Acciones</div>
            </div>
            <div className="data-table-body">
              {propietariosPagination.pageItems.map((p) => (
                <div key={p.id} className="data-table-row">
                  <div>{getNombre(p)}</div>
                  <div>{p.dpi || "-"}</div>
                  <div>{getTelefono(p)}</div>
                  <div>{getDireccion(p)}</div>
                  <div className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => goToDetail(p)}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => openEditModal(p)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger-ghost"
                      onClick={() => handleDelete(p)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={propietariosPagination.total}
            rangeStart={propietariosPagination.rangeStart}
            rangeEnd={propietariosPagination.rangeEnd}
            onPrev={propietariosPagination.prevPage}
            onNext={propietariosPagination.nextPage}
            canPrev={propietariosPagination.canPrev}
            canNext={propietariosPagination.canNext}
          />
        </>
      )}

      <Modal
        title={editing ? "Editar propietario" : "Nuevo propietario"}
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
                !formData.nombre_completo.trim() ||
                !formData.dpi.trim()
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
            Nombre completo
            <input
              type="text"
              value={formData.nombre_completo}
              onChange={(e) =>
                handleFormChange("nombre_completo", e.target.value)
              }
              placeholder="Ej. Juan Pérez López"
            />
          </label>

          <label className="form-label">
            DPI
            <input
              type="text"
              value={formData.dpi}
              onChange={(e) => handleFormChange("dpi", e.target.value)}
              placeholder="1234567890101"
            />
          </label>
        </div>

        <label className="form-label">
          Teléfono
          <input
            type="text"
            value={formData.telefono}
            onChange={(e) =>
              handleFormChange("telefono", e.target.value)
            }
            placeholder="+502 4XXX XXXX"
          />
        </label>

        <label className="form-label">
          Dirección
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) =>
              handleFormChange("direccion", e.target.value)
            }
            placeholder="Dirección del propietario"
          />
        </label>
      </Modal>
    </div>
  );
}

export default PropietariosPage;
