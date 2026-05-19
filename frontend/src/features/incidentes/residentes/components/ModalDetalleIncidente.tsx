"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText, Image } from "lucide-react";
import { Incidente, EstadoIncidencia } from "@/features/incidentes/residentes/api/incidencias";

interface ModalDetalleIncidenteProps {
  incidente: Incidente | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const estadoLabel: Record<EstadoIncidencia, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  RESUELTA: "Resuelta",
  CANCELADA: "Cancelada",
};

const getEstadoColor = (estado: EstadoIncidencia) => {
  const colors: Record<EstadoIncidencia, string> = {
    PENDIENTE: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    EN_PROCESO: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    RESUELTA: "bg-green-100 text-green-800 hover:bg-green-100",
    CANCELADA: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };
  return colors[estado] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const formatFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export function ModalDetalleIncidente({
  incidente,
  open,
  onOpenChange,
}: ModalDetalleIncidenteProps) {
  if (!incidente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Detalle de Incidencia</DialogTitle>
          <DialogDescription>
            Información completa de la incidencia reportada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información principal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{incidente.motivo}</h3>
              <p className="text-sm text-muted-foreground">{incidente.descripcion}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getEstadoColor(incidente.estado)}>
                {estadoLabel[incidente.estado]}
              </Badge>
              {incidente.prioridad && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  {incidente.prioridad.charAt(0).toUpperCase() +
                    incidente.prioridad.slice(1).toLowerCase()}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatFecha(incidente.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Anónimo: </span>
                {incidente.es_anonimo ? "Sí" : "No"}
              </div>
              {incidente.token_seguimiento && (
                <div>
                  <span className="text-muted-foreground">Token: </span>
                  <span className="font-mono text-xs">{incidente.token_seguimiento}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resultado esperado */}
          {incidente.resultado_esperado && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resultado esperado
              </h4>
              <p className="text-sm text-muted-foreground">{incidente.resultado_esperado}</p>
            </div>
          )}

          {/* Resultado solución */}
          {incidente.resultado_solucion && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Solución aplicada
              </h4>
              <p className="text-sm text-muted-foreground">{incidente.resultado_solucion}</p>
            </div>
          )}

          {/* Evidencias */}
          {incidente.evidencias && incidente.evidencias.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Evidencias adjuntas
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {incidente.evidencias.map((ev, idx) => (
                  <a
                    key={idx}
                    href={ev.url_archivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline truncate"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    {ev.nombre_archivo}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
