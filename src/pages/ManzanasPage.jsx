import React, { useEffect, useState } from "react";
import {
  listManzanas,
  createManzana,
  updateManzana,
  deleteManzana,
} from "../api/manzanas";
import Modal from "../components/common/Modal";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";

function ManzanasPage() {
  const [manzanas, setManzanas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // manzana o null
  const [nombreInput, setNombreInput] = useState("");
  const manzanasPagination = usePagination(manzanas);

  async function loadManzanas() {
    setLoading(true);
    setError("");
    try {
      const data = await listManzanas(search);
      setManzanas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las manzanas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadManzanas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setNombreInput("");
    setModalOpen(true);
  };

  const openEditModal = (manzana) => {
    setEditing(manzana);
    setNombreInput(manzana.nombre || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nombreInput.trim()) return;

    setSaving(true);
    setError("");

    try {
      if (editing) {
        await updateManzana(editing.id, { nombre: nombreInput.trim() });
      } else {
        await createManzana({ nombre: nombreInput.trim() });
      }

      setModalOpen(false);
      setEditing(null);
      setNombreInput("");
      await loadManzanas();
    } catch (err) {
      console.error(err);
      setError("Error al guardar la manzana.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (manzana) => {
    if (
      !window.confirm(
        `¿Eliminar la manzana "${manzana.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setError("");
    try {
      await deleteManzana(manzana.id);
      await loadManzanas();
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo eliminar la manzana. Puede que tenga nichos asociados."
      );
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadManzanas();
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Manzanas</h2>
          <p>Gestiona los bloques (manzanas) del cementerio.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Nueva manzana
        </button>
      </div>

      <form className="section-filters" onSubmit={handleSearchSubmit}>
        <div className="filter-group">
          <label className="filter-label">
            Buscar por nombre
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ej. Manzana A"
            />
          </label>
        </div>
        <button type="submit" className="btn-outline">
          Buscar
        </button>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando manzanas...</div>
      ) : manzanas.length === 0 ? (
        <div className="empty-state">No se encontraron manzanas.</div>
      ) : (
        <>
          <div className="data-table">
            <div className="data-table-header">
              <div>ID</div>
              <div>Nombre</div>
              <div className="col-actions">Acciones</div>
            </div>
            <div className="data-table-body">
              {manzanasPagination.pageItems.map((m) => (
                <div key={m.id} className="data-table-row">
                  <div>{m.id}</div>
                  <div>{m.nombre}</div>
                  <div className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => openEditModal(m)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-danger-ghost"
                      onClick={() => handleDelete(m)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={manzanasPagination.total}
            rangeStart={manzanasPagination.rangeStart}
            rangeEnd={manzanasPagination.rangeEnd}
            onPrev={manzanasPagination.prevPage}
            onNext={manzanasPagination.nextPage}
            canPrev={manzanasPagination.canPrev}
            canNext={manzanasPagination.canNext}
          />
        </>
      )}

      <Modal
        title={editing ? "Editar manzana" : "Nueva manzana"}
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditing(null);
            setNombreInput("");
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
                  setNombreInput("");
                }
              }}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              type="button"
              onClick={handleSave}
              disabled={saving || !nombreInput.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <label className="form-label">
          Nombre de la manzana
          <input
            type="text"
            value={nombreInput}
            onChange={(e) => setNombreInput(e.target.value)}
            placeholder="Ej. Manzana A"
          />
        </label>
      </Modal>
    </div>
  );
}

export default ManzanasPage;
