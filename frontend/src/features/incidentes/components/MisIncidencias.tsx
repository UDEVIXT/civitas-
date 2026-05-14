"use client";

import React from "react";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { Incidente } from "@/services/incidentes.service";

const mockMisIncidentes: Incidente[] = [
  {
    id: 1,
    titulo: "Fuga de agua",
    tipo: "Queja",
    descripcionBreve: "Fuga en tubería principal del baño del apartamento 205",
    lugar: "Apartamento 205",
    fechaHoraReporte: "07/05/2026 09:30",
    estadoActual: "Pendiente",
    prioridad: "Alta",
    fechaUltimaActualizacion: "07/05/2026 10:00",
    reportadoAnonimamente: false,
  },
  {
    id: 4,
    titulo: "Aire acondicionado",
    tipo: "Queja",
    descripcionBreve: "Ruido extraño en unidad del apartamento 101",
    lugar: "Apartamento 101",
    fechaHoraReporte: "07/05/2026 11:45",
    estadoActual: "Pendiente",
    prioridad: "Baja",
    fechaUltimaActualizacion: "07/05/2026 11:45",
    reportadoAnonimamente: true,
  },
  {
    id: 6,
    titulo: "Ascensor averiado",
    tipo: "Incidencia",
    descripcionBreve: "El ascensor principal se detiene entre pisos",
    lugar: "Ascensor principal",
    fechaHoraReporte: "07/05/2026 07:00",
    estadoActual: "Pendiente",
    prioridad: "Alta",
    fechaUltimaActualizacion: "07/05/2026 08:30",
    reportadoAnonimamente: false,
  },
  {
    id: 9,
    titulo: "Piscina sucia",
    tipo: "Incidencia",
    descripcionBreve: "El agua de la piscina está turbia y necesita limpieza",
    lugar: "Área de piscina",
    fechaHoraReporte: "04/05/2026 12:30",
    estadoActual: "Resuelto",
    prioridad: "Baja",
    fechaUltimaActualizacion: "05/05/2026 09:00",
    reportadoAnonimamente: true,
  },
];

export function MisIncidencias() {
  return <TablaEstadoIncidentes data={mockMisIncidentes} />;
}