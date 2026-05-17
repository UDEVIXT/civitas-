"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Search, QrCode, Calendar, Clock } from "lucide-react";
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

export default function RecordCard({ record, groupBy, personTypeStyles, personTypeLabels, onSelectRecord }: Props) {
  return (
    <article key={record.id_bitacora} className="rounded-xl border border-[#e5e5e5] bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
              getAvatarColor(record.nombre_persona),
            )}
          >
            {getInitials(record.nombre_persona)}
          </div>
          <p className="truncate text-sm font-semibold text-[#2f2f2f]">{record.nombre_persona}</p>
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
              groupBy === 'metodo' ? (record.metodo_acceso === "QR" ? "text-[#2f2f2f]" : "text-[#9b9b9b]") : "text-[#6b6b6b]",
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
  );
}
