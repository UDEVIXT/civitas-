"use client";

import * as React from "react";
import {
  actualizarFrecuenciaVisitante,
  getMiBitacora,
  getMiBitacoraDetalle,
} from "../data/bitacora";
import type { MiBitacoraItem, MiBitacoraDetalle, PersonaBitacora } from "../types";

type SortDirection = "asc" | "desc";
type SortField = 'fecha_hora_entrada' | 'fecha_hora_salida' | 'metodo' | null;

const PAGE_SIZE = 10;
const REFRESH_INTERVAL_MS = 15000;

function getSortValue(
  record: MiBitacoraItem,
  sortField: SortField,
  sort: SortDirection,
): number | string {
  if (sortField === 'metodo') {
    const order: Record<MiBitacoraItem['metodo_acceso'], number> = {
      QR: 0,
      lista: 1,
      manual: 2,
    };

    return order[record.metodo_acceso] ?? 99;
  }

  if (sortField === 'fecha_hora_salida') {
    if (!record.fecha_hora_salida) {
      return sort === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }

    return new Date(record.fecha_hora_salida).getTime();
  }

  return new Date(record.fecha_hora_entrada).getTime();
}

function sortBitacoraRecords(
  records: MiBitacoraItem[],
  sortField: SortField,
  sort: SortDirection,
) {
  const direction = sort === 'asc' ? 1 : -1;

  return [...records].sort((a, b) => {
    const aValue = getSortValue(a, sortField, sort);
    const bValue = getSortValue(b, sortField, sort);

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const numericDiff = aValue - bValue;
      if (numericDiff !== 0) return numericDiff * direction;
    } else if (aValue < bValue) {
      return -1 * direction;
    } else if (aValue > bValue) {
      return 1 * direction;
    }

    const dateDiff = new Date(a.fecha_hora_entrada).getTime() - new Date(b.fecha_hora_entrada).getTime();
    return dateDiff * direction;
  });
}

export function useMiBitacora(residentUserId: string) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [personType, setPersonType] = React.useState<"all" | PersonaBitacora>("all");
  const [sort, setSort] = React.useState<SortDirection>("desc");
  const [sortField, setSortField] = React.useState<SortField>('fecha_hora_entrada');
  const [groupBy, setGroupBy] = React.useState<'metodo' | 'nombre' | 'tipo' | 'guardia' | null>(null);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [allRecords, setAllRecords] = React.useState<MiBitacoraItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const hasLoadedRef = React.useRef(false);

  const [selected, setSelected] = React.useState<MiBitacoraItem | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<MiBitacoraDetalle | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [updatingFrecuenciaId, setUpdatingFrecuenciaId] = React.useState<string | null>(null);
  const [updateFrecuenciaMessage, setUpdateFrecuenciaMessage] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchList = React.useCallback(
    async (isRefresh = false) => {
      if (!residentUserId.trim()) {
        setAllRecords([]);
        hasLoadedRef.current = false;
        setError("No se pudo identificar al residente autenticado.");
        return;
      }

      try {
        const isInitialLoad = !hasLoadedRef.current;
        if (!isRefresh && isInitialLoad) {
          setLoading(true);
        } else {
          setIsUpdating(true);
        }
        setError(null);

        const baseFilters = {
          search,
          personType: personType === "all" ? undefined : personType,
          dateFrom: dateFrom ? `${dateFrom}T00:00:00.000Z` : undefined,
          dateTo: dateTo ? `${dateTo}T23:59:59.999Z` : undefined,
          page: 1,
          limit: PAGE_SIZE,
        };

        const firstResponse = await getMiBitacora(baseFilters);
        const totalPagesFromApi = firstResponse.meta.totalPages ?? 1;

        const extraRequests = Array.from({ length: Math.max(0, totalPagesFromApi - 1) }, (_, index) =>
          getMiBitacora({ ...baseFilters, page: index + 2 }),
        );

        const extraResponses = extraRequests.length > 0 ? await Promise.all(extraRequests) : [];
        const combinedRecords = [firstResponse, ...extraResponses].flatMap((response) => response.data);

        setAllRecords(combinedRecords);
        hasLoadedRef.current = true;
        if (combinedRecords.length === 0) {
          setSelected(null);
          setSelectedDetail(null);
          setDetailError(null);
        }
      } catch (cause) {
        // limpiar datos parciales y mostrar mensaje de usuario amigable
        setAllRecords([]);
        hasLoadedRef.current = false;
        setSelected(null);
        setSelectedDetail(null);
        setDetailError(null);

        setError(
          cause instanceof Error
            ? cause.message
            : "¡Ups! Ocurrió un problema al cargar tu bitácora. Ya lo estamos arreglando, intenta de nuevo en unos minutos.",
        );
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    },
    [dateFrom, dateTo, personType, residentUserId, search],
  );

  const onSelectRecord = React.useCallback(async (record: MiBitacoraItem) => {
    setSelected(record);
    setSelectedDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const response = await getMiBitacoraDetalle(record.id_bitacora);
      setSelectedDetail(response.data);
    } catch (cause) {
      setDetailError(
        cause instanceof Error
          ? cause.message
          : "No se pudo cargar el detalle del registro.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // SSE: escuchar actualizaciones del backend para actualizar inmediatamente
  React.useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:3002/api/";

    // build full base URL preserving any path (e.g. /api/) so SSE hits /api/bitacora/updates
    let backendBase = apiUrl;
    try {
      const u = new URL(apiUrl);
      // keep pathname (like /api/) and origin
      backendBase = `${u.origin}${u.pathname.replace(/\/$/, '')}`;
    } catch {
      // fallback
      backendBase = apiUrl.replace(/\/$/, '');
    }

    let source: EventSource | null = null;
    try {
      const eventSourceOptions: EventSourceInit = { withCredentials: true };
      source = new EventSource(`${backendBase}/bitacora/updates`, eventSourceOptions);
    } catch {
      return undefined;
    }

    source.onmessage = async (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as { ids_afectados?: string[] };
        await fetchList(true);

        if (selected && payload.ids_afectados?.includes(selected.id_bitacora)) {
          await onSelectRecord(selected);
        }
      } catch {
        await fetchList(true);
      }
    };

    return () => {
      try {
        if (source) {
          source.onmessage = null;
          source.close();
        }
      } catch {
        // ignore
      }
    };
    // deliberate: fetchList/onSelectRecord/selected included so SSE triggers correctly
  }, [fetchList, onSelectRecord, selected]);



  async function onToggleFrecuencia(idBitacora: string, currentEsFrecuente: boolean) {
    setUpdatingFrecuenciaId(idBitacora);
    setUpdateFrecuenciaMessage(null);

    try {
      const newValue = !currentEsFrecuente;
      await actualizarFrecuenciaVisitante(idBitacora, newValue);

      setUpdateFrecuenciaMessage({
        type: "success",
        message: newValue ? "Marcado como frecuente" : "Removido de frecuentes",
      });

      void fetchList(true);

      if (selected?.id_bitacora === idBitacora) {
        const response = await getMiBitacoraDetalle(idBitacora);
        setSelectedDetail(response.data);
      }

      window.setTimeout(() => setUpdateFrecuenciaMessage(null), 3000);
    } catch (cause) {
      setUpdateFrecuenciaMessage({
        type: "error",
        message: cause instanceof Error ? cause.message : "No fue posible actualizar la frecuencia.",
      });
      window.setTimeout(() => setUpdateFrecuenciaMessage(null), 4000);
    } finally {
      setUpdatingFrecuenciaId(null);
    }
  }

  React.useEffect(() => {
    void Promise.resolve().then(() => fetchList(false));
  }, [fetchList]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchList(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchList]);

  const sortedRecords = React.useMemo(() => sortBitacoraRecords(allRecords, sortField, sort), [allRecords, sortField, sort]);

  const groupedAll = React.useMemo(() => {
    if (groupBy === null) return [{ method: '', items: sortedRecords }];

    const map = new Map<string, MiBitacoraItem[]>();
    const getKey = (r: MiBitacoraItem) => {
      if (groupBy === 'nombre') return (r.nombre_persona?.[0] ?? '-').toUpperCase();
      if (groupBy === 'tipo') return (r.tipo_persona || '') as string;
      if (groupBy === 'guardia') return r.guardia?.nombre ?? 'Sin guardia';
      return r.metodo_acceso || 'manual';
    };

    for (const r of sortedRecords) {
      const key = getKey(r);
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }

    if (groupBy === 'metodo') {
      const order = ['QR', 'lista', 'manual'];
      return order.filter((k) => map.has(k)).map((k) => ({ method: k, items: map.get(k)! }));
    }

    const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return keys.map((k) => ({ method: k, items: map.get(k)! }));
  }, [sortedRecords, groupBy]);

  const flattenedAll = React.useMemo(() => (groupBy === null ? sortedRecords : groupedAll.flatMap((g) => g.items)), [groupedAll, sortedRecords, groupBy]);

  const totalPages = Math.max(1, Math.ceil(flattenedAll.length / PAGE_SIZE));
  const currentPage = page;
  const paginatedFlattened = flattenedAll.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const groupedRecords = React.useMemo(() => {
    if (groupBy === null) return [{ method: '', items: paginatedFlattened }];

    const map = new Map<string, MiBitacoraItem[]>();
    const getKey = (r: MiBitacoraItem) => {
      if (groupBy === 'nombre') return (r.nombre_persona?.[0] ?? '-').toUpperCase();
      if (groupBy === 'tipo') return (r.tipo_persona || '') as string;
      if (groupBy === 'guardia') return r.guardia?.nombre ?? 'Sin guardia';
      return r.metodo_acceso || 'manual';
    };

    for (const r of paginatedFlattened) {
      const key = getKey(r);
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }

    if (groupBy === 'metodo') {
      const order = ['QR', 'lista', 'manual'];
      return order.filter((k) => map.has(k)).map((k) => ({ method: k, items: map.get(k)! }));
    }

    const keys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    return keys.map((k) => ({ method: k, items: map.get(k)! }));
  }, [paginatedFlattened, groupBy]);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.slice(Math.max(0, currentPage - 2), Math.min(pages.length, currentPage + 3));

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSort('desc');
    }
    setPage(1);
  }

  function toggleGroup(field: 'metodo' | 'nombre' | 'tipo' | 'guardia') {
    setPage(1);
    setGroupBy((prev) => (prev === field ? null : field));
  }

  return {
    // state
    searchInput,
    setSearchInput,
    search,
    setSearch,
    personType,
    setPersonType,
    sort,
    setSort,
    sortField,
    setSortField,
    groupBy,
    setGroupBy,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    // data
    allRecords,
    loading,
    isUpdating,
    error,
    // selection
    selected,
    selectedDetail,
    detailLoading,
    detailError,
    updatingFrecuenciaId,
    updateFrecuenciaMessage,
    // helpers
    fetchList,
    sortedRecords,
    groupedAll,
    flattenedAll,
    totalPages,
    paginatedFlattened,
    groupedRecords,
    pages,
    visiblePages,
    toggleSort,
    toggleGroup,
    onSelectRecord,
    onToggleFrecuencia,
    // setters (for UI actions)
    setSelected,
    setSelectedDetail,
  } as const;
}

export default useMiBitacora;
