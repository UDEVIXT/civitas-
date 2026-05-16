"use client";

import React, { useState } from "react";
import { Plus, Wrench, Package, Droplets, Flame, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Importamos el modal que acabas de crear
import { ModalServicio } from "@/features/servicios-domicilio/components/modal-servicio";
import type { ServicioDomicilioFormValues } from "@/features/servicios-domicilio/schemas/servicio.schema";

// Datos de prueba temporales para visualizar la tabla (Mock)
const SERVICIOS_MOCK = [
  { id: "1", empresa: "Gas Sur", tipo: "Gas", frecuencia: "RECURRENTE", fecha: "2026-05-18", estatus: "Activo", icono: Flame, color: "text-orange-500" },
  { id: "2", empresa: "Amazon", tipo: "Paquetería", frecuencia: "UNICA_VEZ", fecha: "2026-05-16", estatus: "Pendiente", icono: Package, color: "text-amber-600" },
  { id: "3", empresa: "Telmex", tipo: "Internet", frecuencia: "PROGRAMADO", fecha: "2026-05-20", estatus: "Pendiente", icono: Wifi, color: "text-blue-500" },
];

export default function MisServiciosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Esta función se ejecuta cuando el modal hace el "submit" válido
  const handleSaveServicio = async (values: ServicioDomicilioFormValues) => {
    setIsSaving(true);
    try {
      console.log("Datos listos para enviar al backend:", values);
      // TODO: Aquí llamaremos al apiClient más adelante para guardar en BD (CA005)
      
      // Simulamos que el backend tarda 1 segundo en responder
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsModalOpen(false);
      // Aquí también pondremos un toast de "Servicio registrado con éxito"
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header de la vista */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Servicios a Domicilio
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los accesos de proveedores, paquetería y mantenimiento.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Servicio
        </Button>
      </div>

      {/* Tabla de Servicios */}
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
            {SERVICIOS_MOCK.map((servicio) => {
              const Icon = servicio.icono;
              return (
                <TableRow key={servicio.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-semibold text-gray-900">
                    {servicio.empresa}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${servicio.color}`} />
                      <span className="text-sm font-medium">{servicio.tipo}</span>
                    </div>
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
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* El Modal que diseñamos (Controlado por el estado isModalOpen) */}
      {isModalOpen && (
        <ModalServicio
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveServicio}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}