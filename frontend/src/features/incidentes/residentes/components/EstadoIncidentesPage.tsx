"use client";

import React from "react";
import { MisIncidencias } from "./MisIncidencias";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Incidente } from "@/features/incidentes/residentes/api/incidencias";

const mockTodasIncidencias: Incidente[] = [
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
  {
    id_incidencia: "5",
    titulo: "Luz pasillo",
    descripcion: "La luz del pasillo del segundo piso no funciona",
    estado: "PENDIENTE",
    prioridad: "MEDIA",
    es_anonimo: false,
    fecha_creacion: "2026-05-08T14:20:00Z",
    updatedAt: "2026-05-08T14:20:00Z",
    id_residente: "residente-2",
    historial: [],
  },
  {
    id_incidencia: "6",
    titulo: "Puerta garaje",
    descripcion: "La puerta del garaje no abre completamente",
    estado: "EN_PROCESO",
    prioridad: "ALTA",
    es_anonimo: false,
    fecha_creacion: "2026-05-06T16:00:00Z",
    updatedAt: "2026-05-06T17:30:00Z",
    id_residente: "residente-3",
    historial: [
      {
        id_historial: "h3",
        estado_anterior: "PENDIENTE",
        nuevo_estado: "EN_PROCESO",
        comentario: "Técnico en camino",
        fecha: "2026-05-06T17:30:00Z",
        actualizado_por: "Admin",
        id_incidencia: "6",
      },
    ],
  },
  {
    id_incidencia: "7",
    titulo: "Jardín descuidado",
    descripcion: "Las áreas verdes necesitan mantenimiento",
    estado: "RESUELTA",
    prioridad: "MEDIA",
    es_anonimo: true,
    fecha_creacion: "2026-05-03T10:00:00Z",
    updatedAt: "2026-05-04T15:00:00Z",
    id_residente: "residente-2",
    historial: [
      {
        id_historial: "h4",
        estado_anterior: "PENDIENTE",
        nuevo_estado: "RESUELTA",
        comentario: "Mantenimiento realizado",
        fecha: "2026-05-04T15:00:00Z",
        actualizado_por: "Admin",
        id_incidencia: "7",
      },
    ],
  },
  {
    id_incidencia: "8",
    titulo: "Wi-Fi lento",
    descripcion: "La conexión a internet es muy lenta en el área común",
    estado: "PENDIENTE",
    prioridad: "MEDIA",
    es_anonimo: false,
    fecha_creacion: "2026-05-09T09:00:00Z",
    updatedAt: "2026-05-09T09:00:00Z",
    id_residente: "residente-4",
    historial: [],
  },
];

export function EstadoIncidentesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold">Incidencias</h1>

      <Tabs defaultValue="mis-incidencias">
        <TabsList>
          <TabsTrigger value="mis-incidencias">Mis incidencias</TabsTrigger>
          <TabsTrigger value="todas">Todas las incidencias</TabsTrigger>
        </TabsList>

        <TabsContent value="mis-incidencias">
          <MisIncidencias />
        </TabsContent>

        <TabsContent value="todas">
          <TablaEstadoIncidentes data={mockTodasIncidencias} />
        </TabsContent>
      </Tabs>
    </div>
  );
}