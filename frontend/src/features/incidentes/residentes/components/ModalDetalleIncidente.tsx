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
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
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
  if (isNaN(fecha.getTime())) return { fecha: "—", hora: "—" };
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return { fecha: `${dia}/${mes}/${anio}`, hora: `${horas}:${minutos}` };
};

export function ModalDetalleIncidente({
  incidente,
  open,
  onOpenChange,
}: ModalDetalleIncidenteProps) {
  if (!incidente) return null;

  const fechaCreacion = formatFecha(incidente.fecha_creacion);
  const fechaActualizacion = formatFecha(incidente.updatedAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Detalle de Incidencia</DialogTitle>
          <DialogDescription>
            Información completa y historial de cambios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información principal */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{incidente.titulo}</h3>
              <p className="text-sm text-muted-foreground">{incidente.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{fechaCreacion.fecha}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{fechaCreacion.hora}</span>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Reportado anónimamente:</span>{" "}
                {incidente.es_anonimo ? "Sí" : "No"}
              </div>
              <div>
                <span className="text-muted-foreground">Última actualización:</span>{" "}
                {fechaActualizacion.fecha} {fechaActualizacion.hora}
              </div>
            </div>
          </div>

          {/* Historial de cambios */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial de Cambios
            </h4>

            {incidente.historial && incidente.historial.length > 0 ? (
              <div className="space-y-3">
                {incidente.historial.map((historial, index) => (
                  <div
                    key={historial.id_historial}
                    className="bg-muted/50 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      <Badge className={getEstadoColor(historial.estado_anterior)}>
                        {estadoLabel[historial.estado_anterior]}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getEstadoColor(historial.nuevo_estado)}>
                        {estadoLabel[historial.nuevo_estado]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatFecha(historial.fecha).fecha}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatFecha(historial.fecha).hora}
                      </div>
                    </div>

                    {historial.comentario && (
                      <p className="text-sm italic">"{historial.comentario}"</p>
                    )}

                    {historial.actualizado_por && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Actualizado por: {historial.actualizado_por}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No hay historial de cambios para esta incidencia.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
