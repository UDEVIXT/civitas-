"use client";

import * as React from "react";
import { AlertCircle, QrCode, Search, Star, X, ChevronUp, ChevronDown, Clock, Calendar, Filter } from "lucide-react";
import FiltersPanel from "./FiltersPanel";
import useMiBitacora from "../hooks/useMiBitacora";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

// data logic moved to hook
import type {
  MiBitacoraDetalle,
  MiBitacoraItem,
  PersonaBitacora,
} from "../types";

type SortDirection = "asc" | "desc";
// SortField is handled inside the hook

// paging and refresh handled inside the hook

const personTypeOptions: Array<{ label: string; value: "all" | PersonaBitacora }> = [
  { label: "Todos", value: "all" },
  { label: "Visitantes", value: "visitante" },
  { label: "Empleados", value: "empleado" },
  { label: "Proveedores", value: "proveedor" },
];

const sortOptions: Array<{ label: string; value: SortDirection }> = [
  { label: "Más reciente", value: "desc" },
  { label: "Más antiguo", value: "asc" },
];

const personTypeLabels: Record<PersonaBitacora, string> = {
  visitante: "Visitante",
  empleado: "Empleado doméstico",
  proveedor: "Proveedor",
};

const personTypeStyles: Record<PersonaBitacora, string> = {
  visitante: "border-[#bfd7ff] bg-[#edf4ff] text-[#3f6bb6]",
  empleado: "border-[#b5ebda] bg-[#eafaf4] text-[#228c68]",
  proveedor: "border-[#f5dcc2] bg-[#fdf4ea] text-[#b46a2c]",
};

function getInitials(nombre?: string | null): string {
  const value = (nombre || "").trim();
  if (!value) return "--";

  return value
    .split(" ")
    .slice(0, 2)
    .map((word) => (word ? word[0] : ""))
    .join("")
    .toUpperCase();
}

function getAvatarColor(nombre?: string | null): string {
  const colors = [
    "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-rose-100 text-rose-700",
  ];
  const value = nombre || "";
  if (!value.length) return colors[0];
  return colors[value.charCodeAt(0) % colors.length];
}

function formatDateTime(value: string | null) {
  if (!value || value === "-") return "Pendiente";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pendiente";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getRecordName(record: MiBitacoraItem | MiBitacoraDetalle) {
  return record.nombre_persona || "";
}

export function MiBitacoraPage() {
  const { user } = useAuth();
  const residentUserId = user?.nombre ?? "";

  const {
    searchInput,
    setSearchInput,
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
    loading,
    isUpdating,
    error,
    selected,
    selectedDetail,
    detailLoading,
    detailError,
    updatingFrecuenciaId,
    updateFrecuenciaMessage,
    fetchList,
    sortedRecords,
    groupedAll,
    totalPages,
    paginatedFlattened,
    groupedRecords,
    visiblePages,
    toggleSort,
    toggleGroup,
    onSelectRecord,
    onToggleFrecuencia,
    setSelected,
  } = useMiBitacora(residentUserId);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, setSearch, setPage]);


  const residentTag = residentUserId.trim() || "Residente";
  const [showFilters, setShowFilters] = React.useState(false);

  // sorting/grouping handlers provided by hook (toggleSort, toggleGroup)

  return (
    <div className="min-h-screen bg-[#ececec] p-2 sm:p-4">
      <div className="mx-auto min-h-[calc(100vh-16px)] max-w-360 overflow-hidden rounded-[30px] border border-[#d3d3d3] bg-[#ececec] sm:min-h-[calc(100vh-32px)]">
        <section className="flex min-w-0 flex-1 flex-col bg-[#ececec]">
          <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[36px] font-semibold leading-none text-[#1f1f1f]">Bitácora de accesos</h1>
              <div className="relative w-full sm:w-70">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9b9b9b]" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search"
                  className="h-10 rounded-md border-[#d2d2d2] bg-white pl-9 text-sm"
                />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button type="button" className="flex h-8 items-center gap-2 rounded-md border border-[#d2d2d2] bg-white px-3 text-xs font-medium text-[#2c2c2c]" disabled>
                {residentTag} <X className="size-3" />
              </button>

              <select
                value={personType}
                onChange={(event) => {
                  setPersonType(event.target.value as "all" | PersonaBitacora);
                  setPage(1);
                }}
                className="h-8 rounded-md border border-[#d2d2d2] bg-white px-2 text-xs text-[#2c2c2c]"
              >
                {personTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortDirection);
                  setPage(1);
                }}
                className="h-8 rounded-md border border-[#d2d2d2] bg-white px-2 text-xs text-[#2c2c2c]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-35 rounded-md border-[#d2d2d2] bg-white px-2 text-xs"
                title="Desde"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-35 rounded-md border-[#d2d2d2] bg-white px-2 text-xs"
                title="Hasta"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters((s) => !s)}
                  className="ml-2 inline-flex h-8 items-center gap-2 rounded-md border border-[#d2d2d2] bg-white px-3 text-xs font-medium text-[#2c2c2c]"
                  aria-label="Mostrar filtros"
                >
                  <Filter className="size-3 text-[#6b6b6b]" />
                  <span>Filtros</span>
                </button>

                {showFilters ? (
                  <FiltersPanel
                    personType={personType}
                    setPersonType={setPersonType}
                    sort={sort}
                    setSort={setSort}
                    dateFrom={dateFrom}
                    setDateFrom={setDateFrom}
                    dateTo={dateTo}
                    setDateTo={setDateTo}
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    setSearch={setSearch}
                    setPage={setPage}
                    fetchList={fetchList}
                    groupBy={groupBy}
                    setGroupBy={setGroupBy}
                    setSortField={setSortField}
                    onClose={() => setShowFilters(false)}
                  />
                ) : null}
              </div>
            </div>

            {error ? (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            ) : null}

            {updateFrecuenciaMessage ? (
              <div className={cn("mb-3 rounded-md border p-3", updateFrecuenciaMessage.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50") }>
                <p className={cn("text-sm font-medium", updateFrecuenciaMessage.type === "success" ? "text-emerald-800" : "text-red-800")}>{updateFrecuenciaMessage.message}</p>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[10px] border border-[#d3d3d3] bg-white">
              <div className="flex items-center justify-between border-b border-[#d9d9d9] px-4 py-3">
                <h2 className="text-[22px] font-semibold leading-none text-[#1f1f1f]">Mi bitácora de accesos</h2>
                <div className="flex items-center gap-3">
                  {isUpdating ? <span className="text-[11px] text-[#8a8a8a]">Actualizando...</span> : null}
                  <p className="text-xs text-[#7559e8]">{sortedRecords.length} registrados</p>
                </div>
              </div>

              {loading && sortedRecords.length === 0 ? (
                <div className="flex min-h-45 items-center justify-center px-4 py-10 text-sm text-slate-500">Cargando registros...</div>
              ) : paginatedFlattened.length === 0 ? (
                <div className="flex min-h-57.5 items-center justify-center px-4 py-10">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff6dd] shadow-[0_0_0_8px_rgba(251,191,36,0.12)]">
                      <AlertCircle className="size-5 text-[#e2aa00]" />
                    </div>
                    <p className="text-sm font-semibold text-[#353535]">Aún no tienes registros</p>
                    <p className="max-w-[20rem] text-xs leading-5 text-[#747474]">Cuando existan ingresos o salidas, aparecerán en tu bitácora de accesos.</p>
                    <p className="text-xs leading-5 text-[#9a9a9a]">Podrás consultar el historial y abrir el detalle de cada registro.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 p-3 md:hidden">
                    {groupedRecords.map((group) => {
                      return (
                        <section key={group.method}>
                              {groupBy !== null ? (
                                <div className="mb-2 flex items-center gap-2">
                                  <h3 className="text-sm font-semibold">
                                    {group.method} <span className="text-xs text-[#7a7a7a]">({groupedAll.find((g) => g.method === group.method)?.items.length ?? group.items.length})</span>
                                  </h3>
                                </div>
                              ) : null}

                        {group.items.map((record) => (
                          <article key={record.id_bitacora} className="rounded-xl border border-[#e5e5e5] bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                                    getAvatarColor(getRecordName(record)),
                                  )}
                                >
                                  {getInitials(getRecordName(record))}
                                </div>
                                <p className="truncate text-sm font-semibold text-[#2f2f2f]">{getRecordName(record)}</p>
                              </div>
                              <Badge
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                                  personTypeStyles[record.tipo_persona],
                                )}
                              >
                                {personTypeLabels[record.tipo_persona]}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 text-xs text-[#4d4d4d]">
                              <div className="flex items-center gap-2">
                                <Calendar className="size-3.5 text-[#6b6b6b]" />
                                <span className="font-medium">Entrada:</span>
                                <span>{formatDateTime(record.fecha_hora_entrada)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="size-3.5 text-[#6b6b6b]" />
                                <span className="font-medium">Salida:</span>
                                <span>{record.fecha_hora_salida ? formatDateTime(record.fecha_hora_salida) : "-"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                  <QrCode
                                    className={cn(
                                      "size-3.5",
                                      groupBy === 'metodo'
                                        ? (record.metodo_acceso === "QR" ? "text-[#2f2f2f]" : "text-[#9b9b9b]")
                                        : "text-[#6b6b6b]",
                                    )}
                                  />
                                <span className="font-medium">Método:</span>
                                <span>{record.metodo_acceso}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Guardia:</span>
                                <span>{record.guardia?.nombre ?? record.guardia?.id_guardia ?? "-"}</span>
                              </div>
                            </div>

                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-md border border-[#dfdfdf] px-2.5 py-1.5 text-xs text-[#3f3f3f] hover:bg-[#f6f6f6]"
                                onClick={() => void onSelectRecord(record)}
                                title="Ver detalle"
                              >
                                <Search className="size-3.5" />
                                Ver detalle
                              </button>
                            </div>
                          </article>
                        ))}
                        </section>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-245 table-fixed text-sm">
                      <colgroup>
                        <col className="w-55" />
                        <col className="w-45" />
                        <col className="w-45" />
                        <col className="w-35" />
                        <col className="w-35" />
                        <col className="w-40" />
                        <col className="w-27.5" />
                      </colgroup>
                      <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                        <tr className="border-b border-[#dfdfdf] text-[#4f4f4f]">
                          <th className="px-2 py-3 text-center font-medium">
                            <input type="checkbox" className="h-4 w-4 rounded border-[#c7c7c7]" />
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleGroup('nombre')} className={cn('flex items-center gap-2 text-left', groupBy === 'nombre' ? 'font-semibold underline' : '')}>
                              <span className="truncate">Name</span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleGroup('tipo')} className={cn('flex items-center gap-2 text-left', groupBy === 'tipo' ? 'font-semibold underline' : '')}>
                              <span className="truncate">Tipo</span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleSort('fecha_hora_entrada')} className="flex w-full items-center gap-2 text-left">
                              <Calendar className="size-4 shrink-0 text-[#6b6b6b]" />
                              <span className="truncate">Hora Entrada</span>
                              <span className="ml-auto flex size-4 items-center justify-center shrink-0">
                                {sortField === 'fecha_hora_entrada' ? (
                                  sort === 'asc' ? <ChevronUp className="size-4 text-[#6b6b6b]" /> : <ChevronDown className="size-4 text-[#6b6b6b]" />
                                ) : (
                                  <ChevronUp className="size-4 opacity-0" />
                                )}
                              </span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleSort('fecha_hora_salida')} className="flex w-full items-center gap-2 text-left">
                              <Clock className="size-4 shrink-0 text-[#6b6b6b]" />
                              <span className="truncate">Hora Salida</span>
                              <span className="ml-auto flex size-4 items-center justify-center shrink-0">
                                {sortField === 'fecha_hora_salida' ? (
                                  sort === 'asc' ? <ChevronUp className="size-4 text-[#6b6b6b]" /> : <ChevronDown className="size-4 text-[#6b6b6b]" />
                                ) : (
                                  <ChevronUp className="size-4 opacity-0" />
                                )}
                              </span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleSort('metodo')} className="flex w-full items-center gap-2 text-left">
                              <QrCode className="size-4 shrink-0 text-[#6b6b6b]" />
                              <span className="truncate">Método</span>
                              <span className="ml-auto flex size-4 items-center justify-center shrink-0">
                                {sortField === 'metodo' ? (
                                  sort === 'asc' ? <ChevronUp className="size-4 text-[#6b6b6b]" /> : <ChevronDown className="size-4 text-[#6b6b6b]" />
                                ) : (
                                  <ChevronUp className="size-4 opacity-0" />
                                )}
                              </span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-left font-medium">
                            <button type="button" onClick={() => toggleGroup('guardia')} className={cn('flex items-center gap-2 text-left', groupBy === 'guardia' ? 'font-semibold underline' : '')}>
                              <span className="truncate">Guardia</span>
                            </button>
                          </th>
                          <th className="px-3 py-3 text-right font-medium" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ececec]">
                        {groupedRecords.map((group) => (
                          <React.Fragment key={group.method}>
                            {groupBy !== null ? (
                              <tr className="bg-[#fbfbfb] text-[#333333]">
                                <td colSpan={8} className="px-3 py-2 font-semibold">
                                  {group.method} <span className="ml-2 text-xs text-[#7a7a7a]">({groupedAll.find((g) => g.method === group.method)?.items.length ?? group.items.length})</span>
                                </td>
                              </tr>
                            ) : null}
                            {group.items.map((record) => (
                              <tr key={record.id_bitacora} className="bg-white text-[#303030] hover:bg-[#fafafa]">
                                <td className="px-2 py-3 text-center align-middle">
                                  <input type="checkbox" className="h-4 w-4 rounded border-[#c7c7c7]" />
                                </td>
                                <td className="px-3 py-3 align-middle">
                                  <div className="flex items-center gap-2.5">
                                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", getAvatarColor(getRecordName(record)))}>
                                      {getInitials(getRecordName(record))}
                                    </div>
                                    <span className="truncate text-sm font-medium">{getRecordName(record)}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 align-middle text-sm text-[#555555]">
                                  <Badge className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", personTypeStyles[record.tipo_persona])}>
                                    {personTypeLabels[record.tipo_persona]}
                                  </Badge>
                                </td>
                                <td className="px-3 py-3 align-middle text-sm text-[#444444]">{formatDateTime(record.fecha_hora_entrada)}</td>
                                <td className="px-3 py-3 align-middle text-sm text-[#444444]">{record.fecha_hora_salida ? formatDateTime(record.fecha_hora_salida) : "-"}</td>
                                <td className="px-3 py-3 align-middle text-sm text-[#444444]">
                                  <span className="inline-flex items-center gap-1.5">
                                    <QrCode className={cn(
                                      "size-4",
                                      groupBy === 'metodo' ? (record.metodo_acceso === "QR" ? "text-[#2f2f2f]" : "text-[#c2c2c2]") : "text-[#6b6b6b]",
                                    )} />
                                    {record.metodo_acceso}
                                  </span>
                                </td>
                                <td className="px-3 py-3 align-middle text-sm text-[#444444]">{record.guardia?.nombre ?? record.guardia?.id_guardia ?? "-"}</td>
                                <td className="px-3 py-3 align-middle">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      className="rounded p-1 text-[#666666] transition-colors hover:bg-[#f1f1f1] hover:text-[#2b2b2b]"
                                      onClick={() => void onSelectRecord(record)}
                                      title="Ver detalle"
                                    >
                                      <Search className="size-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dfdfdf] px-3 py-3 text-xs text-[#5c5c5c] sm:px-4">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className={cn(
                        "rounded-md border border-[#d2d2d2] bg-white px-3 py-1.5",
                        page === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-[#f8f8f8]",
                      )}
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {visiblePages.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className={cn(
                            "h-6 min-w-6 rounded px-2 text-xs",
                            pageNumber === page
                              ? "bg-[#f2e9ff] font-semibold text-[#7c5dd8]"
                              : "text-[#666666] hover:bg-[#f6f6f6]",
                          )}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                      className={cn(
                        "rounded-md border border-[#d2d2d2] bg-white px-3 py-1.5",
                        page === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-[#f8f8f8]",
                      )}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>

            {selected ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                  <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-[#d3d3d3] bg-white px-6 py-5">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900">Detalle del Acceso</h2>
                      <p className="mt-1 text-sm text-slate-600">Información completa del registro seleccionado</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X className="size-6" />
                    </button>
                  </div>

                  <div className="p-6">
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <p className="font-medium text-slate-600">Cargando detalle...</p>
                      </div>
                    ) : detailError ? (
                      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">{detailError}</p>
                      </div>
                    ) : selectedDetail ? (
                      <>
                        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-4">
                            <div className={cn("flex size-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold", getAvatarColor(selectedDetail.nombre_persona))}>
                              {getInitials(selectedDetail.nombre_persona)}
                            </div>
                            <div>
                              <p className="text-xl font-semibold text-slate-900">{selectedDetail.nombre_persona}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Badge className={cn("", personTypeStyles[selectedDetail.tipo_persona])}>
                                  {personTypeLabels[selectedDetail.tipo_persona]}
                                </Badge>
                                {selectedDetail.es_frecuente ? (
                                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                                    <Star className="mr-1 size-3" fill="currentColor" />Frecuente
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant={selectedDetail.es_frecuente ? "default" : "outline"}
                            onClick={() => void onToggleFrecuencia(selected.id_bitacora, selectedDetail.es_frecuente)}
                            disabled={updatingFrecuenciaId === selected.id_bitacora}
                            className={cn(
                              "gap-2 whitespace-nowrap",
                              selectedDetail.es_frecuente ? "bg-emerald-500 hover:bg-emerald-600" : "border-slate-300 hover:border-slate-400",
                            )}
                          >
                            <Star className={cn("size-4", selectedDetail.es_frecuente && "fill-current")} />
                            {selectedDetail.es_frecuente ? "Remover" : "Marcar frecuente"}
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                          <div className="space-y-4 lg:col-span-2">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Entrada</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(selectedDetail.fecha_hora_entrada)}</p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Salida</p>
                                <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(selectedDetail.fecha_hora_salida)}</p>
                              </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <h3 className="mb-3 font-semibold text-slate-900">Detalles de Acceso</h3>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-600">Método:</span>
                                  <Badge className="px-2 py-1">{selectedDetail.metodo_acceso}</Badge>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-600">Guardia:</span>
                                  <span className="font-medium text-slate-900">{selectedDetail.guardia?.nombre ?? selectedDetail.guardia?.id_guardia ?? "-"}</span>
                                </div>
                              </div>
                            </div>

                            {selectedDetail.detalle.qr_utilizado ? (
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <h3 className="mb-3 font-semibold text-slate-900">Código QR Utilizado</h3>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 break-all rounded bg-white p-2 font-mono text-xs text-slate-600">{selectedDetail.detalle.qr_utilizado}</code>
                                  <button
                                    type="button"
                                    onClick={() => { navigator.clipboard?.writeText(selectedDetail.detalle.qr_utilizado ?? ""); }}
                                    title="Copiar QR"
                                    className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            <div className="space-y-3">
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-2 text-sm font-medium text-slate-900">Nota de Entrada</p>
                                <p className="text-sm leading-relaxed text-slate-700">
                                  {selectedDetail.detalle.notas_guardia_entrada || <span className="text-slate-400">Sin notas registradas</span>}
                                </p>
                              </div>
                              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="mb-2 text-sm font-medium text-slate-900">Nota de Salida</p>
                                <p className="text-sm leading-relaxed text-slate-700">
                                  {selectedDetail.detalle.notas_guardia_salida || <span className="text-slate-400">Sin notas registradas</span>}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-1">
                            <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-4">
                              <h3 className="mb-3 font-semibold text-slate-900">Foto del Visitante</h3>
                              {selectedDetail.detalle.foto_visitante ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={selectedDetail.detalle.foto_visitante}
                                  alt={`Foto de ${selectedDetail.nombre_persona}`}
                                  className="w-full flex-1 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                                  <p className="px-2 text-center text-xs text-slate-500">No hay foto disponible</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </section>
      </div>
    </div>
  );
}
