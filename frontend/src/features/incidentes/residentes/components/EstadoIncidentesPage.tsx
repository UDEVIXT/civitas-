"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { MisIncidencias } from "./MisIncidencias";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIncidencias } from "../hooks/useIncidentes";

export function EstadoIncidentesPage() {
  const { data: todasIncidencias = [], isLoading, isError } = useIncidencias({});

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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Cargando incidencias...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">Error al cargar las incidencias. Intenta nuevamente.</p>
              </div>
            </div>
          ) : (
            <TablaEstadoIncidentes data={todasIncidencias} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}