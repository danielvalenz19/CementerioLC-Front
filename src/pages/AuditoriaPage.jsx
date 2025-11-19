import React, { useEffect, useState } from "react";
import { listAuditoria } from "../api/auditoria";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";

function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const logsPagination = usePagination(logs);

  // Estado para los filtros
  const [filters, setFilters] = useState({
    usuario_id: "",
    desde: "",
    hasta: "",
  });

  // Función para cargar los datos
  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      // Preparamos los filtros, eliminando valores vacíos
      const cleanFilters = {};
      if (filters.usuario_id) cleanFilters.usuario_id = filters.usuario_id;
      if (filters.desde) cleanFilters.desde = filters.desde;
      if (filters.hasta) cleanFilters.hasta = filters.hasta;

      const data = await listAuditoria(cleanFilters);
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial de auditoría.");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const handleClear = () => {
    setFilters({ usuario_id: "", desde: "", hasta: "" });
    // Pequeño hack para recargar sin filtros inmediatamente
    setTimeout(() => {
      listAuditoria({})
        .then(setLogs)
        .catch(() => {});
    }, 50);
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Auditoría del Sistema</h2>
          <p>Registro histórico de acciones realizadas por los usuarios.</p>
        </div>
        <button className="btn-outline" onClick={loadLogs}>
          Actualizar Lista
        </button>
      </div>

      {/* Barra de Filtros */}
      <form
        className="section-filters"
        onSubmit={handleSearch}
        style={{ alignItems: "flex-end" }}
      >
        <div className="filter-group">
          <label className="filter-label">
            ID Usuario
            <input
              type="number"
              name="usuario_id"
              value={filters.usuario_id}
              onChange={handleFilterChange}
              placeholder="Ej. 1"
              style={{ width: "100px" }}
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
          <button type="submit" className="btn-primary">
            Buscar
          </button>
          <button type="button" className="btn-ghost" onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </form>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando registros...</div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          No se encontraron registros con estos criterios.
        </div>
      ) : (
        <>
          <div className="data-table">
            <div
              className="data-table-header"
              style={{ gridTemplateColumns: "0.5fr 1.5fr 1.5fr 2fr" }}
            >
              <div>ID</div>
              <div>Fecha / Hora</div>
              <div>Usuario</div>
              <div>Acción Realizada</div>
            </div>
            <div className="data-table-body">
              {logsPagination.pageItems.map((log) => (
                <div
                  key={log.id}
                  className="data-table-row"
                  style={{ gridTemplateColumns: "0.5fr 1.5fr 1.5fr 2fr" }}
                >
                  <div style={{ color: "#6b7280" }}>#{log.id}</div>
                  <div style={{ fontSize: "13px" }}>
                    {log.fecha ? new Date(log.fecha).toLocaleString() : "-"}
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {log.usuario || `Usuario ID ${log.usuario_id}`}
                  </div>
                  <div>
                    <span
                      className="tag tag-default"
                      style={{ textTransform: "none", fontSize: "13px" }}
                    >
                      {log.accion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={logsPagination.total}
            rangeStart={logsPagination.rangeStart}
            rangeEnd={logsPagination.rangeEnd}
            onPrev={logsPagination.prevPage}
            onNext={logsPagination.nextPage}
            canPrev={logsPagination.canPrev}
            canNext={logsPagination.canNext}
          />
        </>
      )}
    </div>
  );
}

export default AuditoriaPage;
