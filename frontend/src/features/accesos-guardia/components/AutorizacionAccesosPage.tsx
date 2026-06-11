"use client";

import { TablaAccesosManual } from "./TablaAccesosManual";

export function AutorizacionAccesosPage() {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Autorización de accesos manualmente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona y supervisa los accesos autorizados al residencial.
        </p>
      </div>

      <TablaAccesosManual />
    </div>
  );
}
