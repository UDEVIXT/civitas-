"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { useIncidencias } from "../hooks/useIncidentes";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function MisIncidencias() {
  const { user } = useAuth();
  const { data: incidentes = [], isLoading, isError } = useIncidencias(
    user?.id ? { residenteId: user.id } : {}
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando tus incidencias...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">Error al cargar las incidencias. Intenta nuevamente.</p>
        </div>
      </div>
    );
  }

  return <TablaEstadoIncidentes data={incidentes} />;
}