import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAlertasVencimientos } from "../api/alertas";
import TablePagination from "../components/common/TablePagination";
import usePagination from "../hooks/usePagination";

function AlertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const alertasPagination = usePagination(alertas);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAlertasVencimientos();
        setAlertas(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las alertas.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Alertas de Vencimiento</h2>
          <p>Arrendamientos que vencen en los próximos 30 días.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="loading-placeholder">Cargando alertas...</div>
      ) : alertas.length === 0 ? (
        <div className="empty-state">
          ¡Excelente! No hay vencimientos próximos.
        </div>
      ) : (
        <>
          <div className="data-table">
            <div
              className="data-table-header"
              style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1fr" }}
            >
              <div>Propietario</div>
              <div>Ubicación</div>
              <div>Vencimiento</div>
              <div>Estado</div>
              <div className="col-actions">Acciones</div>
            </div>
            <div className="data-table-body">
              {alertasPagination.pageItems.map((item, idx) => (
                <div
                  key={`${item.arrendamiento_id}-${idx}`}
                  className="data-table-row"
                  style={{ gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1fr" }}
                >
                  <div style={{ fontWeight: 500 }}>
                    {item.nombres} {item.apellidos}
                  </div>
                  <div>Nicho {item.numero_nicho} (M-{item.manzana_id})</div>
                  <div style={{ color: "#b91c1c", fontWeight: "bold" }}>
                    {item.fecha_fin ? item.fecha_fin.substring(0, 10) : "-"}
                  </div>
                  <div>
                    <span
                      className="tag tag-ocupado"
                      style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                    >
                      Quedan {item.dias_restantes} días
                    </span>
                  </div>
                  <div className="col-actions">
                    <Link
                      to={`/app/arrendamientos/${item.arrendamiento_id}`}
                      className="btn-ghost"
                      style={{
                        textDecoration: "none",
                        fontSize: "12px",
                        display: "inline-block",
                        textAlign: "center",
                      }}
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <TablePagination
            total={alertasPagination.total}
            rangeStart={alertasPagination.rangeStart}
            rangeEnd={alertasPagination.rangeEnd}
            onPrev={alertasPagination.prevPage}
            onNext={alertasPagination.nextPage}
            canPrev={alertasPagination.canPrev}
            canNext={alertasPagination.canNext}
          />
        </>
      )}
    </div>
  );
}

export default AlertasPage;
