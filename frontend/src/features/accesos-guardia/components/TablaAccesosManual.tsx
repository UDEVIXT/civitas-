"use client";

import React, { useState } from "react";
import { FileText, ArrowUpDown, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type TipoVisita = "Visitante" | "Proveedor" | "Empleado";
type EstadoQR = "Activo" | "Expirado" | "Desactivado";

interface AccesoManual {
  id: string;
  nombre: string;
  info_general: string;
  vivienda: string;
  residente_autorizador: string;
  fecha_entrada: string;
  fecha_salida: string | null;
  tipo_visita: TipoVisita;
  estado_qr: EstadoQR;
  nota?: string;
}

const DATOS_ESTATICOS: AccesoManual[] = [
  {
    id: "1",
    nombre: "Carlos Mendoza",
    info_general: "Visita familiar para recoger documentos importantes relacionados con trámites notariales. El residente indicó que puede permanecer hasta 2 horas y tiene autorización para acceder al área de estacionamiento y elevadores.",
    vivienda: "E-10",
    residente_autorizador: "Ana García",
    fecha_entrada: "2026-06-09T10:30:00",
    fecha_salida: "2026-06-09T12:00:00",
    tipo_visita: "Visitante",
    estado_qr: "Expirado",
    nota: "Viene a recoger documentos. Permitir acceso únicamente a la planta baja.",
  },
  {
    id: "2",
    nombre: "Paquetería DHL",
    info_general: "Entrega de paquete, requiere firma del residente.",
    vivienda: "B-03",
    residente_autorizador: "Luis Ramírez",
    fecha_entrada: "2026-06-09T11:00:00",
    fecha_salida: null,
    tipo_visita: "Proveedor",
    estado_qr: "Activo",
    nota: "Entregar en recepción si no hay nadie en casa.",
  },
  {
    id: "3",
    nombre: "María López",
    info_general: "Empleada de limpieza con acceso autorizado.",
    vivienda: "993-NH",
    residente_autorizador: "Jorge Sánchez",
    fecha_entrada: "2026-06-09T08:00:00",
    fecha_salida: "2026-06-09T17:00:00",
    tipo_visita: "Empleado",
    estado_qr: "Expirado",
  },
  {
    id: "4",
    nombre: "Roberto Fuentes",
    info_general: "Familiar directo de la residente.",
    vivienda: "C-07",
    residente_autorizador: "Carmen Torres",
    fecha_entrada: "2026-06-09T14:00:00",
    fecha_salida: null,
    tipo_visita: "Visitante",
    estado_qr: "Activo",
    nota: "Familiar de la residente. Puede acceder sin restricciones.",
  },
  {
    id: "5",
    nombre: "Plomería Rápida SA",
    info_general: "Servicio de reparación, requiere acceso a área técnica.",
    vivienda: "483-TB",
    residente_autorizador: "Pedro Herrera",
    fecha_entrada: "2026-06-08T09:00:00",
    fecha_salida: "2026-06-08T13:30:00",
    tipo_visita: "Proveedor",
    estado_qr: "Desactivado",
    nota: "Reparación de tubería en baño principal. Acceso solo al departamento 3B.",
  },
  {
    id: "6",
    nombre: "Sofia Reyes",
    info_general: "Empleada doméstica con contrato activo.",
    vivienda: "D-12",
    residente_autorizador: "Claudia Morales",
    fecha_entrada: "2026-06-09T07:30:00",
    fecha_salida: null,
    tipo_visita: "Empleado",
    estado_qr: "Activo",
  },
  {
    id: "7",
    nombre: "Alejandro Vega",
    info_general: "Visita de cortesía, sin restricciones adicionales.",
    vivienda: "A-01",
    residente_autorizador: "Roberto Castillo",
    fecha_entrada: "2026-06-08T16:00:00",
    fecha_salida: "2026-06-08T18:00:00",
    tipo_visita: "Visitante",
    estado_qr: "Desactivado",
  },
  {
    id: "8",
    nombre: "Gas Express",
    info_general: "Proveedor de gas, recarga programada mensual.",
    vivienda: "B-05",
    residente_autorizador: "Diana Ruiz",
    fecha_entrada: "2026-06-09T10:00:00",
    fecha_salida: "2026-06-09T10:45:00",
    tipo_visita: "Proveedor",
    estado_qr: "Expirado",
    nota: "Recarga de tanque. Coordinar con encargado de mantenimiento.",
  },
];

const estadoQRBadge: Record<EstadoQR, { label: string; className: string }> = {
  Activo: { label: "Activo", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  Expirado: { label: "Expirado", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0" },
  Desactivado: { label: "Desactivado", className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0" },
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const INFO_TRUNCATE_LENGTH = 80;

export function TablaAccesosManual() {
  const [notaModal, setNotaModal] = useState<AccesoManual | null>(null);
  const [infoModal, setInfoModal] = useState<AccesoManual | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[140px]">Nombre</TableHead>
              <TableHead className="hidden md:table-cell min-w-[160px]">Información general</TableHead>
              <TableHead className="hidden sm:table-cell min-w-[130px]">Propiedad</TableHead>
              <TableHead className="hidden lg:table-cell">
                <span className="flex items-center gap-1">Fecha esperada de llegada <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <span className="flex items-center gap-1">Fecha esperada de salida <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Tipo</TableHead>
              <TableHead>Estado QR</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DATOS_ESTATICOS.map((acceso) => {
              const qrBadge = estadoQRBadge[acceso.estado_qr];
              const isExpanded = expandedId === acceso.id;

              return (
                <React.Fragment key={acceso.id}>
                  <TableRow
                    className="align-middle cursor-pointer sm:cursor-default"
                    onClick={() => setExpandedId(isExpanded ? null : acceso.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">{acceso.nombre}</p>
                          <div className="sm:hidden mt-0.5">
                            <span className="text-xs font-medium">{acceso.vivienda}</span>
                            <span className="text-xs text-muted-foreground"> · {acceso.residente_autorizador}</span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground shrink-0 sm:hidden transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell max-w-[200px]">
                      {acceso.info_general.length > INFO_TRUNCATE_LENGTH ? (
                        <button
                          className="text-left"
                          onClick={(e) => { e.stopPropagation(); setInfoModal(acceso); }}
                        >
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {acceso.info_general}
                          </p>
                          <span className="text-xs text-primary underline-offset-2 hover:underline cursor-pointer">Ver más</span>
                        </button>
                      ) : (
                        <p className="text-sm text-muted-foreground">{acceso.info_general}</p>
                      )}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell">
                      <p className="text-sm font-medium">{acceso.vivienda}</p>
                      <p className="text-xs text-muted-foreground">{acceso.residente_autorizador}</p>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      <p>{formatFecha(acceso.fecha_entrada)}</p>
                      <p className="text-xs text-muted-foreground">{formatHora(acceso.fecha_entrada)}</p>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      {acceso.fecha_salida ? (
                        <>
                          <p>{formatFecha(acceso.fecha_salida)}</p>
                          <p className="text-xs text-muted-foreground">{formatHora(acceso.fecha_salida)}</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sin registrar</span>
                      )}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      {acceso.tipo_visita}
                    </TableCell>

                    <TableCell>
                      <Badge className={qrBadge.className}>{qrBadge.label}</Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-center">
                      {acceso.nota ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={(e) => { e.stopPropagation(); setNotaModal(acceso); }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="sm:hidden bg-muted/30">
                      <TableCell colSpan={8} className="px-4 pb-3 pt-0">
                        <div className="flex flex-col gap-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Información general</p>
                            {acceso.info_general.length > INFO_TRUNCATE_LENGTH ? (
                              <button
                                className="text-left"
                                onClick={() => setInfoModal(acceso)}
                              >
                                <p className="text-sm text-muted-foreground line-clamp-2">{acceso.info_general}</p>
                                <span className="text-xs text-primary hover:underline cursor-pointer">Ver más</span>
                              </button>
                            ) : (
                              <p className="text-muted-foreground">{acceso.info_general}</p>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo</span>
                            <span>{acceso.tipo_visita}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Llegada</span>
                            <span>{formatFecha(acceso.fecha_entrada)} {formatHora(acceso.fecha_entrada)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Salida</span>
                            <span>
                              {acceso.fecha_salida
                                ? `${formatFecha(acceso.fecha_salida)} ${formatHora(acceso.fecha_salida)}`
                                : <span className="italic text-muted-foreground">Sin registrar</span>}
                            </span>
                          </div>
                          {acceso.nota && (
                            <div className="pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => setNotaModal(acceso)}
                              >
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                Ver nota del residente
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!infoModal} onOpenChange={(open) => { if (!open) setInfoModal(null); }}>
        <DialogContent className="sm:max-w-md p-7">
          <DialogHeader>
            <DialogTitle>Información general</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm pt-1">
                <p>Visita de <strong>{infoModal?.nombre}</strong> — Propiedad <strong>{infoModal?.vivienda}</strong>.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm leading-relaxed bg-muted/50 rounded-md px-4 py-3">
              {infoModal?.info_general}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!notaModal} onOpenChange={(open) => { if (!open) setNotaModal(null); }}>
        <DialogContent className="sm:max-w-md p-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Nota del residente
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm pt-1">
                <p>
                  Instrucciones para el acceso de{" "}
                  <strong>{notaModal?.nombre}</strong>, autorizado por{" "}
                  <strong>{notaModal?.residente_autorizador}</strong>.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm leading-relaxed bg-muted/50 rounded-md px-4 py-3">
              {notaModal?.nota}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
