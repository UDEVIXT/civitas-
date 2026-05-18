"use client";

import * as React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  QrCode, ListCheck, NotebookPen, Calendar, Clock, ShieldCheck,
  ChevronDown, ChevronUp, Building2, Tag, Home,
} from "lucide-react";
import { format } from "date-fns";
import { BitacoraFiltro, BitacoraRegistro } from "../api/bitacora";
import { PaginacionTabla } from "./PaginacionTabla";
import { ModalDetalleRegistro } from "./ModalDetalleRegistro";

interface TablaAccesosGuardiaProps {
  filtros: BitacoraFiltro;
  onPageChange?: (page: number) => void;
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
    visitante: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    residente: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
    empleado_domestico: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200",
    proveedor: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  };
  return colors[tipo] || "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
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
    entrada: "bg-green-100 text-green-800 border-green-200",
    dentro: "bg-green-100 text-green-800 border-green-200",
    salida: "bg-red-100 text-red-800 border-red-200",
    fuera: "bg-red-100 text-red-800 border-red-200",
    excedido: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return variants[estado] || "bg-gray-100 text-gray-800 border-gray-200";
};

const MetodoIcon = ({ metodo }: { metodo: string }) => {
  const norm = (metodo || "").trim().toLowerCase();
  if (norm === "qr") return <><QrCode className="h-4 w-4" /><span>QR</span></>;
  if (norm === "lista") return <><ListCheck className="h-4 w-4" /><span>Lista</span></>;
  if (norm === "manual") return <><NotebookPen className="h-4 w-4" /><span>Manual</span></>;
  return <span className="capitalize">{metodo?.trim()}</span>;
};

// ── Tarjeta acordeón para móvil ──────────────────────────────────────────────
function RegistroCard({
  registro,
  selected,
  onToggle,
  onOpen,
  onRegisterExit,
}: {
  registro: BitacoraRegistro;
  selected: boolean;
  onToggle: () => void;
  onOpen: (id: string) => void;
  onRegisterExit: (r: BitacoraRegistro) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const fechaEntrada = registro.fecha_entrada ? new Date(registro.fecha_entrada) : null;
  const fechaSalida = registro.fecha_salida && registro.fecha_salida !== "-"
    ? new Date(registro.fecha_salida) : null;

  return (
    <div className={`border rounded-lg overflow-hidden ${selected ? "ring-2 ring-primary" : ""}`}>
      {/* Cabecera */}
      <div className="flex items-center gap-2 px-3 py-3 bg-background">
        {/* Checkbox */}
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer shrink-0"
          disabled={!!fechaSalida}
          checked={selected}
          onChange={onToggle}
        />
        {/* Botón expansión */}
        <button
          className="flex-1 flex items-center justify-between gap-3 text-left cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 shrink-0">
              {registro.avatar_url ? (
                <img src={registro.avatar_url} alt={registro.nombre} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {registro.nombre?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{registro.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="outline" className={`${getEstadoBadge(registro.estado)} text-xs`}>
                  {registro.estado}
                </Badge>
                <Badge variant="outline" className={`${getTipoPersonaColor(registro.tipo_persona)} text-xs`}>
                  {getTipoPersonaLabel(registro.tipo_persona)}
                </Badge>
              </div>
            </div>
          </div>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
        </button>
      </div>

      {/* Contenido desplegable */}
      {expanded && (
        <div className="border-t bg-muted/20 px-4 py-3 space-y-2.5 text-sm">
          {registro.empresa && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="font-medium text-foreground">{registro.empresa}</span>
            </div>
          )}

          {registro.residente_asociado?.nombre && registro.residente_asociado.nombre !== "-" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="h-4 w-4 shrink-0" />
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {registro.residente_asociado.avatar_url ? (
                    <img src={registro.residente_asociado.avatar_url} alt={registro.residente_asociado.nombre} className="h-full w-full object-cover rounded-full" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                      {registro.residente_asociado.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium text-foreground">{registro.residente_asociado.nombre}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4 shrink-0" />
            <span className="font-medium mr-1">Método:</span>
            <div className="flex items-center gap-1.5">
              <MetodoIcon metodo={registro.metodo_acceso} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-medium mr-1">Guardia:</span>
            <span>{registro.guardia_registro}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Entrada</p>
              {fechaEntrada ? (
                <>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(fechaEntrada, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(fechaEntrada, "HH:mm")}</span>
                  </div>
                </>
              ) : <span className="text-muted-foreground">-</span>}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Salida</p>
              {fechaSalida ? (
                <>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(fechaSalida, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(fechaSalida, "HH:mm")}</span>
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs mt-1 cursor-pointer"
                  onClick={() => onRegisterExit(registro)}
                >
                  Registrar Salida
                </Button>
              )}
            </div>
          </div>

          <button
            className="w-full mt-1 text-xs text-primary font-medium py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={() => onOpen(registro.id)}
          >
            Ver detalle completo
          </button>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
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
  const [selectedRegistroId, setSelectedRegistroId] = React.useState<string | null>(null);

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
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <h3 className="text-lg font-semibold text-destructive">Error al cargar datos</h3>
        <p className="text-muted-foreground">No se pudieron cargar los registros. Por favor, intente nuevamente.</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  if (!bitacoraData?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">No hay registros</h3>
        <p className="text-muted-foreground mt-2">No se encontraron registros que coincidan con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Vista móvil: acordeón ── */}
      <div className="flex flex-col gap-2 md:hidden">
        {bitacoraData.data.map((registro: BitacoraRegistro) => (
          <RegistroCard
            key={registro.id}
            registro={registro}
            selected={selectedIds.includes(registro.id)}
            onToggle={() => onToggleSelection(registro.id)}
            onOpen={handleRowClick}
            onRegisterExit={onRegisterExitClick}
          />
        ))}
      </div>

      {/* ── Vista escritorio: tabla original ── */}
      <Table className="border rounded-lg hidden md:table">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-center">✓</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Proveedor o empresa</TableHead>
            <TableHead className="text-center">Tipo de acceso</TableHead>
            <TableHead className="text-center">Residente asociado</TableHead>
            <TableHead className="text-center">Método de acceso</TableHead>
            <TableHead className="text-center">Guardia que registró</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center">Fecha y hora entrada</TableHead>
            <TableHead className="text-center">Fecha y hora salida</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bitacoraData.data.map((registro: BitacoraRegistro) => {
            const fechaEntrada = registro.fecha_entrada ? new Date(registro.fecha_entrada) : null;
            const fechaSalida = registro.fecha_salida && registro.fecha_salida !== "-"
              ? new Date(registro.fecha_salida) : null;
            const metodoNorm = (registro.metodo_acceso || "").trim().toLowerCase();

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
                    onChange={(e) => { e.stopPropagation(); onToggleSelection(registro.id); }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {registro.avatar_url ? (
                        <img src={registro.avatar_url} alt={registro.nombre} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                          {registro.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">{registro.nombre}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {registro.empresa
                    ? <span className="font-medium">{registro.empresa}</span>
                    : <span className="text-muted-foreground">-</span>}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={getTipoPersonaColor(registro.tipo_persona)}>
                    {getTipoPersonaLabel(registro.tipo_persona)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {registro.residente_asociado?.nombre && registro.residente_asociado.nombre !== "-" ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Avatar className="h-8 w-8">
                        {registro.residente_asociado.avatar_url ? (
                          <img src={registro.residente_asociado.avatar_url} alt={registro.residente_asociado.nombre} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                            {registro.residente_asociado.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">{registro.residente_asociado.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {metodoNorm === "qr" ? (
                    <div className="flex items-center justify-center gap-2"><QrCode className="h-5 w-5" /><span>QR</span></div>
                  ) : metodoNorm === "lista" ? (
                    <div className="flex items-center justify-center gap-2"><ListCheck className="h-5 w-5" /><span>Lista</span></div>
                  ) : metodoNorm === "manual" ? (
                    <div className="flex items-center justify-center gap-2"><NotebookPen className="h-5 w-5" /><span>Manual</span></div>
                  ) : (
                    <span className="capitalize">{registro.metodo_acceso?.trim()}</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{registro.guardia_registro}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`capitalize ${getEstadoBadge(registro.estado)}`}>
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
                        <Clock className="h-3.5 w-3.5" />
                        <span>{format(fechaEntrada, "HH:mm")}</span>
                      </div>
                    </div>
                  ) : <span className="text-muted-foreground text-sm">-</span>}
                </TableCell>
                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                  {fechaSalida ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(fechaSalida, "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{format(fechaSalida, "HH:mm")}</span>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onRegisterExitClick(registro); }}
                    >
                      Registrar Salida
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {bitacoraData?.meta && (
        <PaginacionTabla
          currentPage={bitacoraData.meta.page}
          totalPages={bitacoraData.meta.total_pages}
          totalItems={bitacoraData.meta.total}
          onPageChange={onPageChange || (() => { })}
        />
      )}

      <ModalDetalleRegistro
        isOpen={modalOpen}
        onClose={handleCloseModal}
        registroId={selectedRegistroId}
        onRegisterExitClick={onRegisterExitClick}
      />
    </div>
  );
}