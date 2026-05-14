"use client";

import React from "react";
import { MisIncidencias } from "./MisIncidencias";
import { TablaEstadoIncidentes } from "./TablaEstadoIncidentes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EstadoIncidentesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Incidencias</h1>

      <Tabs defaultValue="mis-incidencias">
        <TabsList>
          <TabsTrigger value="mis-incidencias">Mis incidencias</TabsTrigger>
          <TabsTrigger value="todas">Todas las incidencias</TabsTrigger>
        </TabsList>

        <TabsContent value="mis-incidencias">
          <MisIncidencias />
        </TabsContent>

        <TabsContent value="todas">
          <TablaEstadoIncidentes />
        </TabsContent>
      </Tabs>
    </div>
  );
}