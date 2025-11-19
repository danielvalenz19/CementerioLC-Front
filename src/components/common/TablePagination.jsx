import React from "react";

function TablePagination({
  total,
  rangeStart,
  rangeEnd,
  onPrev,
  onNext,
  canPrev,
  canNext,
}) {
  const hasData = total > 0;
  const rangeLabel = hasData ? `${rangeStart}-${rangeEnd}` : "0";

  return (
    <div className="table-pagination">
      <span>
        Mostrando {rangeLabel} de {total} registros
      </span>
      <div className="table-pagination-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={onPrev}
          disabled={!canPrev}
        >
          ← Anteriores 20
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={onNext}
          disabled={!canNext}
        >
          Siguientes 20 →
        </button>
      </div>
    </div>
  );
}

export default TablePagination;
