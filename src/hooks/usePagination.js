import { useEffect, useMemo, useState } from "react";

export default function usePagination(items = [], pageSize = 20) {
  const [page, setPage] = useState(0);

  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  useEffect(() => {
    setPage(0);
  }, [items, pageSize]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = total === 0 ? 0 : page * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, (page + 1) * pageSize);

  return {
    page,
    pageSize,
    pageItems,
    total,
    totalPages,
    rangeStart,
    rangeEnd,
    canPrev: page > 0 && total > 0,
    canNext: page < totalPages - 1 && total > 0,
    nextPage: () => setPage((prev) => Math.min(totalPages - 1, prev + 1)),
    prevPage: () => setPage((prev) => Math.max(0, prev - 1)),
    goToPage: setPage,
  };
}
