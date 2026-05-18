 import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Tipo temporal para nuestros datos de prueba limpios
export type ServicioMock = {
  id: string;
  empresa: string;
  tipo: string;
  frecuencia: string;
  fecha: string;
  estatus: string;
};

interface TablaServiciosProps {
  servicios: ServicioMock[];
}

export function TablaServicios({ servicios }: TablaServiciosProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-bold text-gray-600">Empresa / Proveedor</TableHead>
            <TableHead className="font-bold text-gray-600">Tipo</TableHead>
            <TableHead className="font-bold text-gray-600">Frecuencia</TableHead>
            <TableHead className="font-bold text-gray-600">Fecha Esperada</TableHead>
            <TableHead className="font-bold text-gray-600 text-right">Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicios.map((servicio) => (
            <TableRow key={servicio.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="font-semibold text-gray-900">
                {servicio.empresa}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-gray-700">{servicio.tipo}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-gray-50 text-gray-600 font-semibold">
                  {servicio.frecuencia.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 font-medium">
                {servicio.fecha}
              </TableCell>
              <TableCell className="text-right">
                <Badge className={servicio.estatus === "Activo" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}>
                  {servicio.estatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}