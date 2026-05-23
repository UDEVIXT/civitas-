"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Search, QrCode, ListCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

import type { MiBitacoraItem } from "../types";

interface Props {
  record: MiBitacoraItem;
  groupBy: string | null;
  personTypeStyles: Record<string, string>;
  personTypeLabels: Record<string, string>;
  onSelectRecord: (r: MiBitacoraItem) => Promise<void> | void;
}

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

export default function RecordRow({ record, groupBy, personTypeStyles, personTypeLabels, onSelectRecord }: Props) {
  return (
    <tr key={record.id_bitacora} className="bg-white text-[#303030] hover:bg-[#fafafa]">
      <td className="px-5 py-3 align-middle">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", getAvatarColor(record.nombre_persona))}>
            {getInitials(record.nombre_persona)}
          </div>
          <span className="truncate text-sm font-medium">{record.nombre_persona}</span>
        </div>
      </td>
      <td className="px-5 py-3 align-middle text-sm text-[#555555]">
        <Badge className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", personTypeStyles[record.tipo_persona])}>
          {personTypeLabels[record.tipo_persona]}
        </Badge>
      </td>
      <td className="px-5 py-3 align-middle text-sm text-[#444444]">{formatDateTime(record.fecha_hora_entrada)}</td>
      <td className="px-5 py-3 align-middle text-sm text-[#444444]">{record.fecha_hora_salida ? formatDateTime(record.fecha_hora_salida) : "-"}</td>
      <td className="px-5 py-3 align-middle text-sm text-[#444444]">
        <span className="inline-flex items-center gap-1.5">
          {record.metodo_acceso === 'QR' ? (
            <QrCode className={cn(
              "size-4",
              groupBy === 'metodo' ? (record.metodo_acceso === "QR" ? "text-[#2f2f2f]" : "text-[#c2c2c2]") : "text-[#6b6b6b]",
            )} />
          ) : record.metodo_acceso === 'lista' ? (
            <ListCheck className={cn(
              "size-4",
              groupBy === 'metodo' ? (record.metodo_acceso === "lista" ? "text-[#2f2f2f]" : "text-[#c2c2c2]") : "text-[#6b6b6b]",
            )} />
          ) : (
            <QrCode className={cn("size-4", "text-[#6b6b6b]")} />
          )}
          {record.metodo_acceso}
        </span>
      </td>
      <td className="px-5 py-3 align-middle text-sm text-[#444444]">
        <span className="inline-flex items-center gap-2">
          <Shield className="size-4 text-[#6b6b6b]" />
          <span className="truncate">{record.guardia?.nombre ?? record.guardia?.id_guardia ?? "-"}</span>
        </span>
      </td>
      <td className="px-5 py-3 align-middle">
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
  );
}
