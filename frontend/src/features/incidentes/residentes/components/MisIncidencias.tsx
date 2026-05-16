"use client";

import React from "react";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { Incidente } from "@/features/incidentes/residentes/api/incidencias";

const mockMisIncidentes: Incidente[] = [
  {
    id_incidencia: "1",
    titulo: "Fuga de agua",
    descripcion: "Fuga en tubería principal del baño del apartamento 205",
    estado: "PENDIENTE",
    prioridad: "ALTA",
    es_anonimo: false,
    fecha_creacion: "2026-05-07T09:30:00Z",
    updatedAt: "2026-05-07T10:00:00Z",
    id_residente: "residente-1",
    historial: [],
  },
  {
    id_incidencia: "2",
    titulo: "Aire acondicionado",
    descripcion: "Ruido extraño en unidad del apartamento 101",
    estado: "PENDIENTE",
    prioridad: "BAJA",
    es_anonimo: true,
    fecha_creacion: "2026-05-07T11:45:00Z",
    updatedAt: "2026-05-07T11:45:00Z",
    id_residente: "residente-1",
    historial: [],
  },
  {
    id_incidencia: "3",
    titulo: "Ascensor averiado",
    descripcion: "El ascensor principal se detiene entre pisos",
    estado: "EN_PROCESO",
    prioridad: "ALTA",
    es_anonimo: false,
    fecha_creacion: "2026-05-07T07:00:00Z",
    updatedAt: "2026-05-07T08:30:00Z",
    id_residente: "residente-1",
    historial: [
      {
        id_historial: "h1",
        estado_anterior: "PENDIENTE",
        nuevo_estado: "EN_PROCESO",
        comentario: "Enviado a mantenimiento",
        fecha: "2026-05-07T08:30:00Z",
        actualizado_por: "Admin",
        id_incidencia: "3",
      },
    ],
  },
  {
    id_incidencia: "4",
    titulo: "Piscina sucia",
    descripcion: "El agua de la piscina está turbia y necesita limpieza",
    estado: "RESUELTA",
    prioridad: "BAJA",
    es_anonimo: true,
    fecha_creacion: "2026-05-04T12:30:00Z",
    updatedAt: "2026-05-05T09:00:00Z",
    id_residente: "residente-1",
    historial: [
      {
        id_historial: "h2",
        estado_anterior: "PENDIENTE",
        nuevo_estado: "RESUELTA",
        comentario: "Limpieza completada",
        fecha: "2026-05-05T09:00:00Z",
        actualizado_por: "Admin",
        id_incidencia: "4",
      },
    ],
  },
];

export function MisIncidencias() {
  return <TablaEstadoIncidentes data={mockMisIncidentes} />;
}