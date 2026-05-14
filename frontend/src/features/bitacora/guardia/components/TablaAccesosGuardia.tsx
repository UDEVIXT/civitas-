"use client";

import * as React from "react";

// Componentes UI
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
import { Button } from "@/components/ui/button";

// Icons
import {
  QrCode,
  ListCheck,
  NotebookPen,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { BitacoraFiltro, BitacoraRegistro } from "../api/bitacora";
import { PaginacionTabla } from "./PaginacionTabla";
import { ModalDetalleRegistro } from "./ModalDetalleRegistro";

interface TablaAccesosGuardiaProps {
  filtros: BitacoraFiltro;
  onPageChange?: (page: number) => void;
  // Nuevas props para manejar estado desde el padre
  bitacoraData: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onRegisterExitClick: (registro: BitacoraRegistro) => void;
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
    salida: "bg-red-100 text-red-800",
  };
  return variants[estado] || "bg-gray-100 text-gray-800";
};

export function TablaAccesosGuardia({
  onPageChange,
  bitacoraData,
  isLoading,
  error,
  refetch,
  selectedIds,
  onToggleSelection,
  onRegisterExitClick,
}: TablaAccesosGuardiaProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedRegistroId, setSelectedRegistroId] = React.useState<
    string | null
  >(null);

  const handleRowClick = (registroId: string) => {
    setSelectedRegistroId(registroId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRegistroId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index: number) => (
          <div key={index} className="space-y-2">
            <div className="h-12 w-full bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error al cargar datos
          </h3>
          <p className="text-muted-foreground mt-2">
            No se pudieron cargar los registros de la bitácora. Por favor,
            intente nuevamente.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!bitacoraData?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No hay registros</h3>
          <p className="text-muted-foreground mt-2">
            No se encontraron registros que coincidan con los filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table className="border rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-center">✓</TableHead>
            <TableHead>Nombre del proveedor o empresa</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Residente asociado</TableHead>
            <TableHead className="text-center">Método de acceso</TableHead>
            <TableHead className="text-center">Guardia que registró</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center"> Fecha y hora de entrada </TableHead>
            <TableHead className="text-center"> Fecha y hora de salida </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bitacoraData.data.map((registro: BitacoraRegistro) => {
            const fechaEntrada = registro.fecha_entrada
              ? new Date(registro.fecha_entrada)
              : null;
            const fechaSalida =
              registro.fecha_salida && registro.fecha_salida !== "-"
                ? new Date(registro.fecha_salida)
                : null;
            return (
              <TableRow
                key={registro.id}
                className="py-8 cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(registro.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer"
                    disabled={!!fechaSalida}
                    checked={selectedIds.includes(registro.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onToggleSelection(registro.id);
                    }}
                  />
                </TableCell>
                <TableCell>
                  {registro.empresa ? (
                    <span className="font-medium">{registro.empresa}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {registro.avatar_url ? (
                        <img
                          src={registro.avatar_url}
                          alt={registro.nombre}
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                          {registro.nombre
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">{registro.nombre}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getTipoPersonaColor(registro.tipo_persona)}>
                    {getTipoPersonaLabel(registro.tipo_persona)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {registro.residente_asociado?.nombre &&
                    registro.residente_asociado.nombre !== "-" ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {registro.residente_asociado.avatar_url ? (
                          <img
                            src={registro.residente_asociado.avatar_url}
                            alt={registro.residente_asociado.nombre}
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                            {registro.residente_asociado.nombre
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">
                        {registro.residente_asociado.nombre}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {registro.metodo_acceso === "QR" ? (
                    <div className="flex items-center justify-center gap-2">
                      <QrCode className="h-5 w-5" />
                      <span>QR</span>
                    </div>
                  ) : registro.metodo_acceso === "lista" ? (
                    <div className="flex items-center justify-center gap-2">
                      <ListCheck className="h-5 w-5" />
                      <span>Lista</span>
                    </div>
                  ) : registro.metodo_acceso === "manual" ? (
                    <div className="flex items-center justify-center gap-2">
                      <NotebookPen className="h-5 w-5" />
                      <span>Manual</span>
                    </div>
                  ) : (
                    <span>{registro.metodo_acceso}</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <ShieldCheck />
                    <span>{registro.guardia_registro}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getEstadoBadge(registro.estado)}>
                    {registro.estado}
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
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
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
                    <span className="text-muted-foreground text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegisterExitClick(registro);
                        }}
                      >
                        Registrar Salida
                      </Button>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Paginación */}
      {bitacoraData?.meta && (
        <PaginacionTabla
          currentPage={bitacoraData.meta.page}
          totalPages={bitacoraData.meta.total_pages}
          totalItems={bitacoraData.meta.total}
          onPageChange={onPageChange || (() => {})}
        />
      )}

      {/* Modal de Detalle */}
      <ModalDetalleRegistro
        isOpen={modalOpen}
        onClose={handleCloseModal}
        registroId={selectedRegistroId}
        onRegisterExitClick={onRegisterExitClick}
      />
    </div>
  );
}
