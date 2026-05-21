"use client";

import * as React from "react";
import { Calendar, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import RecordRow from "./RecordRow";

import type { MiBitacoraItem } from "../types";

interface Group {
  method: string;
  items: MiBitacoraItem[];
}

type GroupByField = 'metodo' | 'nombre' | 'tipo' | 'guardia';

interface Props {
  groupedRecords: Group[];
  groupedAll: Group[];
  groupBy: string | null;
  personTypeStyles: Record<string, string>;
  personTypeLabels: Record<string, string>;
  toggleGroup: (field: GroupByField) => void;
  toggleSort: (field: any) => void;
  sortField: string | null;
  sort: string;
  onSelectRecord: (r: MiBitacoraItem) => Promise<void> | void;
}

export default function RecordsTable({ groupedRecords, groupedAll, groupBy, personTypeStyles, personTypeLabels, toggleGroup, toggleSort, sortField, sort, onSelectRecord }: Props) {
  return (
    <table className="w-full min-w-245 table-fixed text-sm">
      <colgroup>
        <col className="w-60" />
        <col className="w-50" />
        <col className="w-40" />
        <col className="w-40" />
        <col className="w-45" />
        <col className="w-27.5" />
      </colgroup>
      <thead className="bg-[#f5f5f5] sticky top-0 z-10">
        <tr className="border-b border-[#dfdfdf] text-[#4f4f4f]">
          <th className="px-5 py-3 text-left font-medium">
            <button type="button" onClick={() => toggleGroup('nombre')} className={cn('flex items-center gap-2 text-left', groupBy === 'nombre' ? 'font-semibold underline' : '')}>
              <span className="truncate">Name</span>
            </button>
          </th>
          <th className="px-5 py-3 text-left font-medium">
            <button type="button" onClick={() => toggleGroup('tipo')} className={cn('flex items-center gap-2 text-left', groupBy === 'tipo' ? 'font-semibold underline' : '')}>
              <span className="truncate">Tipo</span>
            </button>
          </th>
          <th className="px-5 py-3 text-left font-medium">
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
          <th className="px-5 py-3 text-left font-medium">
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
          <th className="px-5 py-3 text-left font-medium">
            <button type="button" onClick={() => toggleSort('metodo')} className="flex w-full items-center gap-2 text-left">
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
          <th className="px-5 py-3 text-left font-medium">
            <button type="button" onClick={() => toggleGroup('guardia')} className={cn('flex items-center gap-2 text-left', groupBy === 'guardia' ? 'font-semibold underline' : '')}>
              <span className="truncate">Guardia</span>
            </button>
          </th>
          <th className="px-5 py-3 text-right font-medium" />
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
              <RecordRow
                key={record.id_bitacora}
                record={record}
                groupBy={groupBy}
                personTypeStyles={personTypeStyles}
                personTypeLabels={personTypeLabels}
                onSelectRecord={onSelectRecord}
              />
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
