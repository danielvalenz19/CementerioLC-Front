import React, { useEffect, useState } from "react";
import {
  listTarifas,
  createTarifa,
  updateTarifa,
  deleteTarifa,
} from "../api/tarifas";
import Modal from "../components/common/Modal";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";

const moneyFormatter = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
});

function TarifasPage() {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Estado del Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    concepto: "",
    alcance: "",
    monto: "",
    moneda: "GTQ",
    vigencia_desde: "",
    vigencia_hasta: "",
  });
  const tarifasPagination = usePagination(tarifas);

  // Cargar datos
  const loadTarifas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTarifas();
      setTarifas(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las tarifas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTarifas();
  }, []);

  // Abrir modal para Crear
  const openCreateModal = () => {
    setEditing(null);
    setFormData({
      concepto: "",
      alcance: "",
      monto: "",
      moneda: "GTQ",
      vigencia_desde: new Date().toISOString().split("T")[0],
      vigencia_hasta: "",
    });
    setModalOpen(true);
  };

  // Abrir modal para Editar
  const openEditModal = (tarifa) => {
    setEditing(tarifa);
    setFormData({
      concepto: tarifa.concepto || "",
      alcance: tarifa.alcance || "",
      monto: tarifa.monto || "",
      moneda: tarifa.moneda || "GTQ",
      vigencia_desde: tarifa.vigencia_desde
        ? tarifa.vigencia_desde.substring(0, 10)
        : "",
      vigencia_hasta: tarifa.vigencia_hasta
        ? tarifa.vigencia_hasta.substring(0, 10)
        : "",
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.concepto || !formData.monto || !formData.vigencia_desde) {
      alert("Concepto, Monto y Vigencia Desde son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        monto: Number(formData.monto),
        vigencia_hasta: formData.vigencia_hasta || null,
      };

      if (editing) {
        await updateTarifa(editing.id, payload);
      } else {
        await createTarifa(payload);
      }

      setModalOpen(false);
      loadTarifas();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la tarifa");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tarifa) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la tarifa "${tarifa.concepto}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteTarifa(tarifa.id);
      await loadTarifas();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al eliminar la tarifa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Tarifas y Precios</h2>
          <p>Catálogo de precios vigentes para servicios y nichos.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          Nueva Tarifa
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando tarifas...</div>
      ) : tarifas.length === 0 ? (
        <div className="empty-state">No hay tarifas registradas aún.</div>
      ) : (
        <>
          <div className="data-table">
            <div
              className="data-table-header"
              style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr" }}
            >
              <div>Concepto</div>
              <div>Alcance</div>
              <div>Monto</div>
              <div>Vigencia Desde</div>
              <div>Vigencia Hasta</div>
              <div className="col-actions">Acciones</div>
            </div>
            <div className="data-table-body">
              {tarifasPagination.pageItems.map((t) => (
                <div
                  key={t.id}
                  className="data-table-row"
                  style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 0.8fr" }}
                >
                  <div style={{ fontWeight: 500 }}>{t.concepto}</div>
                  <div style={{ color: "#6b7280", fontSize: "13px" }}>
                    {t.alcance || "-"}
                  </div>
                  <div style={{ fontWeight: "bold", color: "#166534" }}>
                    {t.moneda === "USD"
                      ? `$${t.monto}`
                      : moneyFormatter.format(t.monto)}
                  </div>
                  <div>
                    {t.vigencia_desde ? t.vigencia_desde.substring(0, 10) : "-"}
                  </div>
                  <div>
                    {t.vigencia_hasta ? (
                      t.vigencia_hasta.substring(0, 10)
                    ) : (
                      <span className="tag tag-vigente">Indefinido</span>
                    )}
                  </div>
                  <div className="col-actions">
                    <button
                      className="btn-ghost"
                      onClick={() => openEditModal(t)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger-ghost"
                      onClick={() => handleDelete(t)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={tarifasPagination.total}
            rangeStart={tarifasPagination.rangeStart}
            rangeEnd={tarifasPagination.rangeEnd}
            onPrev={tarifasPagination.prevPage}
            onNext={tarifasPagination.nextPage}
            canPrev={tarifasPagination.canPrev}
            canNext={tarifasPagination.canNext}
          />
        </>
      )}

      <Modal
        title={editing ? "Editar Tarifa" : "Nueva Tarifa"}
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <button
              className="btn-outline"
              onClick={() => !saving && setModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <label className="form-label">
            Concepto *
            <input
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej. Compra Nicho Manzana A"
            />
          </label>
          <label className="form-label">
            Alcance
            <input
              name="alcance"
              value={formData.alcance}
              onChange={handleChange}
              placeholder="Ej. Sector Norte"
            />
          </label>
        </div>

        <div className="form-grid" style={{ marginTop: 10 }}>
          <label className="form-label">
            Monto *
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
          </label>
          <label className="form-label">
            Moneda
            <select
              name="moneda"
              value={formData.moneda}
              onChange={handleChange}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            >
              <option value="GTQ">Quetzales (GTQ)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </label>
        </div>

        <div className="form-grid" style={{ marginTop: 10 }}>
          <label className="form-label">
            Vigencia Desde *
            <input
              type="date"
              name="vigencia_desde"
              value={formData.vigencia_desde}
              onChange={handleChange}
            />
          </label>
          <label className="form-label">
            Vigencia Hasta
            <input
              type="date"
              name="vigencia_hasta"
              value={formData.vigencia_hasta}
              onChange={handleChange}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}

export default TarifasPage;
