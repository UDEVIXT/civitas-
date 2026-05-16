"use client";

import * as React from "react";
import { AlertCircle, QrCode, Search, Star, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  actualizarFrecuenciaVisitante,
  getMiBitacora,
  getMiBitacoraDetalle,
} from "../data/bitacora";
import type {
  MiBitacoraDetalle,
  MiBitacoraItem,
  MiBitacoraResponse,
  PersonaBitacora,
} from "../types";

type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;
const REFRESH_INTERVAL_MS = 15000;

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

function toIsoDateRange(dateValue: string, range: "start" | "end") {
  if (!dateValue) return undefined;
  return `${dateValue}${range === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`;
}

function getRecordName(record: MiBitacoraItem | MiBitacoraDetalle) {
  return record.nombre_persona || "";
}

export function MiBitacoraPage({
  initialResidentUserId,
}: {
  initialResidentUserId: string;
}) {
  const [residentUserId, setResidentUserId] = React.useState(initialResidentUserId);
  const [residentName, setResidentName] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [personType, setPersonType] = React.useState<"all" | PersonaBitacora>("all");
  const [sort, setSort] = React.useState<SortDirection>("desc");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);

  const [data, setData] = React.useState<MiBitacoraResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [selected, setSelected] = React.useState<MiBitacoraItem | null>(null);
  const [selectedDetail, setSelectedDetail] = React.useState<MiBitacoraDetalle | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const [updatingFrecuenciaId, setUpdatingFrecuenciaId] = React.useState<string | null>(null);
  const [updateFrecuenciaMessage, setUpdateFrecuenciaMessage] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchList = React.useCallback(
    async (isRefresh = false) => {
      if (!residentUserId.trim() && !residentName.trim()) {
        setData(null);
        setError("Ingresa un ID o nombre de residente para consultar su bitácora.");
        return;
      }

      try {
        if (!isRefresh) {
          setLoading(true);
        }
        setError(null);

        const response = await getMiBitacora({
          residentUserId: residentUserId.trim() || undefined,
          residentName: residentName.trim() || undefined,
          search,
          personType: personType === "all" ? undefined : personType,
          dateFrom: toIsoDateRange(dateFrom, "start"),
          dateTo: toIsoDateRange(dateTo, "end"),
          sort,
          page,
          limit: PAGE_SIZE,
        });

        setData(response);
        if (response.data.length === 0) {
          setSelected(null);
          setSelectedDetail(null);
          setDetailError(null);
        }
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : "No fue posible cargar la bitácora por un problema técnico.",
        );
      } finally {
        setLoading(false);
      }
    },
    [dateFrom, dateTo, page, personType, residentName, residentUserId, search, sort],
  );

  async function onSelectRecord(record: MiBitacoraItem) {
    setSelected(record);
    setSelectedDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const response = await getMiBitacoraDetalle(
        record.id_bitacora,
        residentUserId.trim() || undefined,
        residentName.trim() || undefined,
      );
      setSelectedDetail(response.data);
    } catch (cause) {
      setDetailError(
        cause instanceof Error ? cause.message : "No se pudo cargar el detalle del registro.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function onToggleFrecuencia(idBitacora: string, currentEsFrecuente: boolean) {
    setUpdatingFrecuenciaId(idBitacora);
    setUpdateFrecuenciaMessage(null);

    try {
      const newValue = !currentEsFrecuente;
      await actualizarFrecuenciaVisitante(
        idBitacora,
        newValue,
        residentUserId.trim() || undefined,
        residentName.trim() || undefined,
      );

      setUpdateFrecuenciaMessage({
        type: "success",
        message: newValue ? "Marcado como frecuente" : "Removido de frecuentes",
      });

      void fetchList(true);

      if (selected?.id_bitacora === idBitacora) {
        const response = await getMiBitacoraDetalle(
          idBitacora,
          residentUserId.trim() || undefined,
          residentName.trim() || undefined,
        );
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
    void fetchList(false);
  }, [fetchList]);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      void fetchList(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [fetchList]);

  const records = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const currentPage = data?.meta.page ?? 1;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pages.slice(Math.max(0, currentPage - 2), Math.min(pages.length, currentPage + 3));
  const residentTag = residentUserId.trim() || residentName.trim() || "Administrador";

  return (
    <div className="min-h-screen bg-[#ececec] p-2 sm:p-4">
      <div className="mx-auto min-h-[calc(100vh-16px)] max-w-[1440px] overflow-hidden rounded-[30px] border border-[#d3d3d3] bg-[#ececec] sm:min-h-[calc(100vh-32px)]">
        <section className="flex min-w-0 flex-1 flex-col bg-[#ececec]">
          <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-[36px] font-semibold leading-none text-[#1f1f1f]">Bitácora de accesos</h1>
              <div className="relative w-full sm:w-[280px]">
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
              <Input
                value={residentUserId}
                onChange={(event) => {
                  setResidentUserId(event.target.value);
                  setPage(1);
                }}
                placeholder="ID residente"
                className="h-8 w-[220px] rounded-md border-[#d2d2d2] bg-white px-2 text-xs"
              />

              <button type="button" onClick={() => setResidentUserId("")} className="flex h-8 items-center gap-2 rounded-md border border-[#d2d2d2] bg-white px-3 text-xs font-medium text-[#2c2c2c]">
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
                className="h-8 w-[140px] rounded-md border-[#d2d2d2] bg-white px-2 text-xs"
                title="Desde"
              />

              <Input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setPage(1);
                }}
                className="h-8 w-[140px] rounded-md border-[#d2d2d2] bg-white px-2 text-xs"
                title="Hasta"
              />
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
                <p className="text-xs text-[#7559e8]">{data?.meta.total ?? 0} registrados</p>
              </div>

              {loading ? (
                <div className="flex min-h-[180px] items-center justify-center px-4 py-10 text-sm text-slate-500">Cargando registros...</div>
              ) : records.length === 0 ? (
                <div className="flex min-h-[230px] items-center justify-center px-4 py-10">
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
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] table-fixed text-sm">
                      <colgroup>
                        <col className="w-[220px]" />
                        <col className="w-[180px]" />
                        <col className="w-[180px]" />
                        <col className="w-[140px]" />
                        <col className="w-[140px]" />
                        <col className="w-[160px]" />
                        <col className="w-[110px]" />
                      </colgroup>
                      <thead className="bg-[#f5f5f5]">
                        <tr className="border-b border-[#dfdfdf] text-[#4f4f4f]">
                          <th className="px-2 py-3 text-center font-medium">
                            <input type="checkbox" className="h-4 w-4 rounded border-[#c7c7c7]" />
                          </th>
                          <th className="px-3 py-3 text-left font-medium">Name</th>
                          <th className="px-3 py-3 text-left font-medium">Tipo</th>
                          <th className="px-3 py-3 text-left font-medium">Hora Entrada</th>
                          <th className="px-3 py-3 text-left font-medium">Hora Salida</th>
                          <th className="px-3 py-3 text-left font-medium">Método</th>
                          <th className="px-3 py-3 text-left font-medium">Guardia</th>
                          <th className="px-3 py-3 text-right font-medium" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ececec]">
                        {records.map((record) => (
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
                                <QrCode className={cn("size-4", record.metodo_acceso === "QR" ? "text-[#2f2f2f]" : "text-[#c2c2c2]")} />
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
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#dfdfdf] px-4 py-3 text-xs text-[#5c5c5c]">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={cn(
                        "rounded-md border border-[#d2d2d2] bg-white px-3 py-1.5",
                        currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-[#f8f8f8]",
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
                            pageNumber === currentPage
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
                      disabled={currentPage === totalPages}
                      className={cn(
                        "rounded-md border border-[#d2d2d2] bg-white px-3 py-1.5",
                        currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-[#f8f8f8]",
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
