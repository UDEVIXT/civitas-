import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, QrCode, Trash2, Edit2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Visitante } from "../types";

interface TablaVisitantesProps {
  visitantes: Visitante[];
  onCodigoAccesoClick?: (visitante: Visitante) => void;
}

export function TablaVisitantes({
  visitantes,
  onCodigoAccesoClick,
}: TablaVisitantesProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-semibold text-gray-600 pl-6">
              Nombre
            </TableHead>
            <TableHead className="font-semibold text-gray-600">
              Motivo
            </TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">
              Frecuentes
            </TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">
              Código de acceso
            </TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">
              Status
            </TableHead>
            <TableHead className="font-semibold text-gray-600 text-right pr-6">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitantes.map((visitante) => (
            <TableRow
              key={visitante.id_visitante}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={visitante.url_foto} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs font-bold">
                      {visitante.nombre_completo.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-gray-900">
                    {visitante.nombre_completo}
                  </span>
                </div>
              </TableCell>

              <TableCell className="text-gray-600 text-sm">
                {visitante.motivo_visita}
              </TableCell>

              <TableCell className="text-center">
                <Star
                  className={`inline-block h-5 w-5 ${visitante.es_frecuente ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                />
              </TableCell>

              <TableCell className="text-center">
                <button
                  type="button"
                  onClick={() => onCodigoAccesoClick?.(visitante)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 disabled:opacity-40"
                  disabled={!visitante.codigo_acceso && !visitante.puede_generar_qr}
                  title={
                    visitante.estatus === "Activo"
                      ? "Ver codigo QR"
                      : "Generar nuevo codigo QR"
                  }
                >
                  <QrCode className="inline-block h-5 w-5" />
                </button>
              </TableCell>

              <TableCell className="text-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    visitante.estatus === "Activo"
                      ? "bg-emerald-50 text-emerald-700"
                      : visitante.estatus === "Expirado"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      visitante.estatus === "Activo"
                        ? "bg-emerald-500"
                        : visitante.estatus === "Expirado"
                          ? "bg-amber-500"
                          : "bg-gray-400"
                    }`}
                  ></span>
                  {visitante.estatus}
                </span>
              </TableCell>

              <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-2 text-gray-400">
                  <button className="p-1.5 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 hover:text-blue-500 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
