"use client";

import { TablaAccesosGuardia } from "./TablaAccesosGuardia";
import { FiltrosTabla } from "./FiltrosTabla";

export function BitacoraGuardiaPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Bitacora de Accesos</h1>
      <FiltrosTabla />
      <TablaAccesosGuardia />
    </div>
  );
}
