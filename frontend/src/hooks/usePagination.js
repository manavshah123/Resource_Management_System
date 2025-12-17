import { useState, useMemo, useCallback } from 'react';

export function usePagination(data = [], initialPageSize = 10) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginatedData = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(data.length / pageSize);
  }, [data.length, pageSize]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(0);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages - 1);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    page,
    pageSize,
    paginatedData,
    totalPages,
    totalCount: data.length,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
    handlePageChange,
    handlePageSizeChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
  };
}

