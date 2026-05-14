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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, QrCode, ListCheck, NotebookPen, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { PaginacionTabla } from "../../guardia/components/PaginacionTabla";
import { ModalDetalleRegistro } from "./ModalDetalleRegistro";

interface TablaAccesosAdminProps {
  data: any[];
  loading: boolean;
  onRefresh: () => void;
  meta?: { page: number; total_pages: number; total: number };
  onPageChange?: (page: number) => void;
}

const getTipoPersonaColor = (tipo: string) => {
  const colors: Record<string, string> = {
    visitante: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    residente: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    empleado_domestico: "bg-teal-100 text-teal-800 hover:bg-teal-100",
    proveedor: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };
  return colors[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const getTipoPersonaLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    visitante: "Visitante",
    residente: "Residente",
    empleado_domestico: "Empleado doméstico",
    proveedor: "Proveedor",
  };
  return labels[tipo] || tipo;
};

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, string> = {
    entrada: "bg-green-100 text-green-800",
    dentro: "bg-green-100 text-green-800",
    salida: "bg-red-100 text-red-800",
    fuera: "bg-red-100 text-red-800",
    excedido: "bg-yellow-100 text-yellow-800",
  };
  return variants[estado] || "bg-gray-100 text-gray-800";
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

  return (
    <div className="space-y-4">
      <Table className="border rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Nombre del proveedor o empresa</TableHead>
            <TableHead className="text-center">Tipo de acceso</TableHead>
            <TableHead className="text-center">Propiedad asociada</TableHead>
            <TableHead className="text-center">Método de acceso</TableHead>
            <TableHead className="text-center">Guardia que registró</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Fecha y hora entrada</TableHead>
            <TableHead className="text-center">Fecha y hora salida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                Cargando registros...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                No hay registros que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            data.map((acceso) => {
              const fechaEntrada = acceso.fecha_entrada ? new Date(acceso.fecha_entrada) : null;
              const fechaSalida = acceso.fecha_salida && acceso.fecha_salida !== "-" ? new Date(acceso.fecha_salida) : null;
              const metodoNorm = (acceso.metodo_acceso || "").trim().toLowerCase();

              return (
                <TableRow 
                  key={acceso.id} 
                  className="py-8 cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleRowClick(acceso.id?.toString())}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {acceso.avatar_url ? (
                          <img src={acceso.avatar_url} alt={acceso.nombre} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                            {acceso.nombre?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">{acceso.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {acceso.empresa ? (
                      <span className="font-medium">{acceso.empresa}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getTipoPersonaColor(acceso.tipo_persona)}>
                      {getTipoPersonaLabel(acceso.tipo_persona)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {acceso.residente_asociado?.nombre && acceso.residente_asociado.nombre !== "-" ? (
                      <div className="flex items-center gap-2 justify-center">
                        <Avatar className="h-8 w-8">
                          {acceso.residente_asociado.avatar_url ? (
                            <img src={acceso.residente_asociado.avatar_url} alt={acceso.residente_asociado.nombre} className="h-full w-full object-cover rounded-full" />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                              {acceso.residente_asociado.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">{acceso.residente_asociado.nombre}</span>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">-</div>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-muted-foreground">
                    {metodoNorm === "qr" ? (
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="h-5 w-5" />
                        <span>QR</span>
                      </div>
                    ) : metodoNorm === "lista" ? (
                      <div className="flex items-center justify-center gap-2">
                        <ListCheck className="h-5 w-5" />
                        <span>Lista</span>
                      </div>
                    ) : metodoNorm === "manual" ? (
                      <div className="flex items-center justify-center gap-2">
                        <NotebookPen className="h-5 w-5" />
                        <span>Manual</span>
                      </div>
                    ) : (
                      <span className="capitalize">{acceso.metodo_acceso?.trim()}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{acceso.guardia_registro}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getEstadoBadge(acceso.estado)}>
                      {acceso.estado === "excedido" ? "Excedido" : acceso.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {fechaEntrada ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{format(fechaEntrada, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(fechaEntrada, "HH:mm")}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {fechaSalida ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(fechaSalida, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(fechaSalida, "HH:mm")}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
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