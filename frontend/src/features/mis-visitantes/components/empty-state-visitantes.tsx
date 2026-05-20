/**
 * Este componente es para cuando no hay visitantes registrados
 */

import React from "react";
import { AlertTriangle } from "lucide-react"; // Usamos este icono simulando el triángulo de advertencia de tu diseño

export function EmptyStateVisitantes() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
      <div className="bg-amber-50 p-4 rounded-full mb-4">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Aún no tienes visitantes
      </h3>
      <p className="text-sm text-gray-500 max-w-sm text-center">
        Comienza a agregar personas para tener tu propio registro
      </p>
    </div>
  );
}