import React, { useEffect, useState } from "react";
import { listRecibos, createRecibo } from "../api/recibos";
import { fetchCatalogoPropietarios } from "../api/catalogosApi";
import Modal from "../components/common/Modal";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";
import Select from "react-select";
import selectStyles from "../components/common/selectStyles";

const moneyFormatter = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function RecibosPage() {
  const [recibos, setRecibos] = useState([]);
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [propietariosOptions, setPropietariosOptions] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero_recibo: "",
    monto: "",
    fecha_pago: "",
    propietario_id: null,
  });
  const [saving, setSaving] = useState(false);
  const recibosPagination = usePagination(recibos);

  useEffect(() => {
    loadRecibos();
    loadPropietarios();
  }, []);

  async function loadRecibos(filterState = filters) {
    setLoading(true);
    setError("");
    try {
      const data = await listRecibos(filterState);
      setRecibos(data);
    } catch (err) {
      console.error("Error cargando recibos", err);
      setError("No se pudieron cargar los recibos.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPropietarios() {
    try {
      const data = await fetchCatalogoPropietarios();
      const opts = (Array.isArray(data) ? data : []).map((p) => ({
        value: p.id,
        label: `${p.nombres} ${p.apellidos} (DPI: ${p.dpi || "N/D"})`,
      }));
      setPropietariosOptions(opts);
    } catch (err) {
      console.error("Error cargando propietarios", err);
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    loadRecibos();
  };

  const clearFilters = () => {
    const reset = { desde: "", hasta: "", search: "" };
    setFilters(reset);
    loadRecibos(reset);
  };

  const handleSave = async () => {
    if (
      !formData.numero_recibo ||
      !formData.monto ||
      !formData.fecha_pago ||
      !formData.propietario_id
    ) {
      alert("Número, monto, fecha y propietario son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        propietario_id: formData.propietario_id
          ? formData.propietario_id.value
          : null,
      };

      await createRecibo(payload);
      setModalOpen(false);
      setFormData({
        numero_recibo: "",
        monto: "",
        fecha_pago: "",
        propietario_id: null,
      });
      loadRecibos();
    } catch (err) {
      console.error(err);
      alert("Error al crear recibo. Revisa que el número no esté duplicado.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = (recibo) => {
    const token = localStorage.getItem("access_token");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    fetch(`${API_URL}/api/recibos/${recibo.id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error generando PDF");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch((err) => {
        console.error(err);
        alert("No se pudo generar el recibo PDF.");
      });
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Gestión de Recibos</h2>
          <p>Historial de pagos registrados en el sistema.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Registrar Pago
        </button>
      </div>

      <form
        className="section-filters"
        onSubmit={applyFilters}
        style={{ alignItems: "flex-end" }}
      >
        <div className="filter-group">
          <label className="filter-label">
            Buscar Nº
            <input
              name="search"
              placeholder="Ej. A-001"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </label>
          <label className="filter-label">
            Desde
            <input
              type="date"
              name="desde"
              value={filters.desde}
              onChange={handleFilterChange}
            />
          </label>
          <label className="filter-label">
            Hasta
            <input
              type="date"
              name="hasta"
              value={filters.hasta}
              onChange={handleFilterChange}
            />
          </label>
        </div>
        <div className="filter-actions">
          <button type="submit" className="btn-outline">
            Filtrar
          </button>
          <button type="button" className="btn-ghost" onClick={clearFilters}>
            Limpiar
          </button>
        </div>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando recibos...</div>
      ) : recibos.length === 0 ? (
        <div className="empty-state">
          No hay recibos registrados en este rango.
        </div>
      ) : (
        <>
          <div className="data-table">
            <div
              className="data-table-header"
              style={{
                gridTemplateColumns: "1fr 1fr 1.2fr 2fr 1.4fr 0.8fr",
              }}
            >
              <div>Nº Recibo</div>
              <div>Fecha</div>
              <div>Monto</div>
              <div>Propietario / Pagador</div>
              <div>Concepto</div>
              <div className="col-actions">Acciones</div>
            </div>
            <div className="data-table-body">
              {recibosPagination.pageItems.map((r) => (
                <div
                  key={r.id}
                  className="data-table-row"
                  style={{
                    gridTemplateColumns: "1fr 1fr 1.2fr 2fr 1.4fr 0.8fr",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{r.numero_recibo}</div>
                  <div>{r.fecha_pago ? r.fecha_pago.substring(0, 10) : "-"}</div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      color: "#166534",
                    }}
                  >
                    {moneyFormatter.format(Number(r.monto || 0))}
                  </div>
                  <div>{r.propietario_nombre}</div>
                  <div>
                    <span
                      className="tag tag-default"
                      style={{ fontSize: "11px", textTransform: "none" }}
                    >
                      {r.concepto}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handlePrint(r)}
                      title="Imprimir"
                    >
                      🖨️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={recibosPagination.total}
            rangeStart={recibosPagination.rangeStart}
            rangeEnd={recibosPagination.rangeEnd}
            onPrev={recibosPagination.prevPage}
            onNext={recibosPagination.nextPage}
            canPrev={recibosPagination.canPrev}
            canNext={recibosPagination.canNext}
          />
        </>
      )}

      <Modal
        title="Registrar nuevo recibo"
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        footer={
          <>
            <button
              className="btn-outline"
              onClick={() => {
                if (!saving) setModalOpen(false);
              }}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              disabled={
                saving ||
                !formData.numero_recibo ||
                !formData.monto ||
                !formData.fecha_pago ||
                !formData.propietario_id
              }
              onClick={handleSave}
            >
              {saving ? "Guardando..." : "Registrar Pago"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="form-label">
            Número de Recibo
            <input
              type="text"
              placeholder="Ej. A-1045"
              value={formData.numero_recibo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  numero_recibo: e.target.value,
                }))
              }
            />
          </label>
          <label className="form-label">
            Monto (Q)
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.monto}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monto: e.target.value,
                }))
              }
            />
          </label>
        </div>

        <label className="form-label" style={{ marginTop: 10 }}>
          Fecha de Pago
          <input
            type="date"
            value={formData.fecha_pago}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fecha_pago: e.target.value,
              }))
            }
          />
        </label>

        <label className="form-label" style={{ marginTop: 10 }}>
          Asignar Propietario
          <Select
            options={propietariosOptions}
            value={formData.propietario_id}
            onChange={(opt) =>
              setFormData((prev) => ({ ...prev, propietario_id: opt }))
            }
            placeholder="Buscar propietario..."
            styles={selectStyles}
            isClearable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>

        <p className="dash-muted" style={{ marginTop: 12 }}>
          Debes asignar el pago a un propietario para que quede vinculado en el
          historial.
        </p>
      </Modal>
    </div>
  );
}

export default RecibosPage;
