"use client";

import React from "react";
import { TablaAccesosGuardia } from "./TablaAccesosGuardia";
import { FiltrosTabla } from "./FiltrosTabla";
import { BotonRegistrarSalida } from "./BotonRegistrarSalida";

export function BitacoraGuardiaPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bitácora de Accesos</h1>
        <BotonRegistrarSalida />
      </div>

      <FiltrosTabla />
      <TablaAccesosGuardia />
    </div>
  );
}
