"use client";
import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, QrCode, ClipboardList, PencilLine, List } from "lucide-react";
import { PaginacionTabla } from "../../guardia/components/PaginacionTabla";
import { ModalDetalleRegistro } from "./ModalDetalleRegistro";

interface TablaAccesosAdminProps {
  data: any[];
  loading: boolean;
  onRefresh: () => void;
  meta?: { page: number; total_pages: number; total: number };
  onPageChange?: (page: number) => void;
}

const getTipoBadge = (tipo: string) => {
  const lower = tipo.toLowerCase();
  if (lower.includes("visitante")) return "bg-blue-100 text-blue-800";
  if (lower.includes("residente")) return "bg-purple-100 text-purple-800";
  if (lower.includes("proveedor")) return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-800";
};

export function TablaAccesosAdmin({ data, loading, onRefresh, meta, onPageChange }: TablaAccesosAdminProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegistroId, setSelectedRegistroId] = useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setSelectedRegistroId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRegistroId(null);
  };

  // CA008: Verificar si la persona lleva demasiado tiempo dentro (ej. > 12h)
  const isExceeded = (entryTime: string, exitTime?: string) => {
    if (exitTime) return false;
    const entry = new Date(entryTime).getTime();
    const now = new Date().getTime();
    return (now - entry) > 12 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-4">
      <Table className="border rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-center">Tipo de acceso</TableHead>
            <TableHead className="text-center">Propiedad asociada</TableHead>
            <TableHead className="text-center">Método de acceso</TableHead>
            <TableHead className="text-center">Guardia en turno</TableHead>
            <TableHead className="text-center">Notas Guardia</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Fecha y hora entrada</TableHead>
            <TableHead className="text-center">Fecha y hora salida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                Cargando registros...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No hay registros que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            data.map((acceso) => {
              // Compatibilidad para soportar Mock Data (prueba) y API Real simultáneamente
              const nombre = acceso.nombre || acceso.visitorName;
              const tipo = acceso.tipo_persona || acceso.visitorType || "Desconocido";
              const propiedad = acceso.residente_asociado?.nombre || acceso.propertyId || "-";
              const metodo = acceso.metodo_acceso || acceso.accessMethod;
              const guardia = acceso.guardia_registro || acceso.guardName;
              const notas = acceso.notas_guardia || acceso.guardNotes;
              const entrada = acceso.fecha_entrada || acceso.entryTime;
              const salida = (acceso.fecha_salida && acceso.fecha_salida !== "-") ? acceso.fecha_salida : acceso.exitTime;

              return (
                <TableRow 
                  key={acceso.id} 
                  className="py-4 cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleRowClick(acceso.id?.toString())}
                >
                  <TableCell className="font-medium">{nombre}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`hover:opacity-80 ${getTipoBadge(tipo)}`}>
                      {tipo.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{propiedad}</TableCell>

                  <TableCell className="text-center text-sm">
                    {metodo === "QR" ? (
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="h-5 w-5" />
                        <span>QR</span>
                      </div>
                    ) : metodo === "Manual" || metodo === "manual" ? (
                      <div className="flex items-center justify-center gap-2">
                        <PencilLine className="h-5 w-5" />
                        <span>Manual</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <List className="h-5 w-5" />
                        <span className="capitalize">{metodo || "Lista"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm max-w-[150px] truncate" title={guardia}>
                    {guardia}
                  </TableCell>
                  <TableCell className="text-center">
                    {notas ? (
                      <span className="text-sm text-muted-foreground max-w-[200px] truncate" title={notas}>
                        {notas}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Sin notas</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {salida ? (
                      <Badge variant="outline" className="text-green-600 border-green-200">Finalizado</Badge>
                    ) : (
                      <div className="flex flex-col gap-1 items-center">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">En curso</Badge>
                        {isExceeded(entrada, salida) && (
                          <Badge variant="destructive" className="text-[10px]">Tiempo excedido</Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {entrada && (
                      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(entrada).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(entrada).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {salida ? (
                      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(salida).toLocaleTimeString()}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {/* Paginación */}
      {meta && (
        <PaginacionTabla
          currentPage={meta.page}
          totalPages={meta.total_pages}
          totalItems={meta.total}
          onPageChange={onPageChange || (() => {})}
        />
      )}

      {/* Modal de Detalle */}
      <ModalDetalleRegistro
        isOpen={modalOpen}
        onClose={handleCloseModal}
        registroId={selectedRegistroId}
      />
    </div>
  );
}