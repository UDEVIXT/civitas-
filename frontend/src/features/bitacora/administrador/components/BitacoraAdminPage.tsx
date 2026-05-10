"use client";

import React, { useEffect, useState } from "react";
import { FiltrosTablaAdmin } from "./FiltrosTablaAdmin";
import { TablaAccesosAdmin } from "./TablaAccesosAdmin";
import { bitacoraService, Bitacora } from "@/services/bitacora.service";

export function BitacoraAdminPage() {
  // Estados de datos
  const [records, setRecords] = useState<Bitacora[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de filtros
  const [propertyFilter, setPropertyFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>("desc");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    try {
      // ----- DATOS ESTÁTICOS DE PRUEBA (MOCK DATA) -----
      const mockData: any[] = [
        {
          id: 1,
          visitorName: "Juan Pérez",
          visitorType: "Visitante",
          propertyId: "101",
          entryTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Hace 2 horas
          exitTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Hace 30 minutos
          guardName: "Ramon Díaz",
          guardNotes: "Entró con un paquete",
          accessMethod: "QR",
        },
        {
          id: 2,
          visitorName: "María Gómez",
          visitorType: "Proveedor",
          propertyId: "102",
          entryTime: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // Hace 14 horas (excedido)
          guardName: "Carlos Rodríguez",
          guardNotes: "Camión placas XYZ-123",
          accessMethod: "Manual",
        },
        {
          id: 3,
          visitorName: "Carlos López",
          visitorType: "Residente",
          propertyId: "103",
          entryTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // Hace 15 minutos
          guardName: "Ana Martínez",
          guardNotes: "-",
          accessMethod: "Lista",
        }
      ];

      // Simulamos retraso de red (800ms)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Aplicamos filtros locales sobre la data mockeada para poder probar
      let filteredData = mockData;
      
      // CA005: Filtro por propiedad o residente
      if (propertyFilter) filteredData = filteredData.filter(d => d.propertyId.includes(propertyFilter) || d.visitorName.toLowerCase().includes(propertyFilter.toLowerCase()));
      
      // CA004: Filtro por tipo (Visitante, Proveedor, Residente)
      if (typeFilter !== "todos") filteredData = filteredData.filter(d => d.visitorType.toLowerCase() === typeFilter.toLowerCase());
      
      // CA003: Filtro por rango de fechas
      if (fechaInicio) {
        filteredData = filteredData.filter(d => new Date(d.entryTime) >= new Date(fechaInicio));
      }
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23, 59, 59, 999); // Incluir todo el día final
        filteredData = filteredData.filter(d => new Date(d.entryTime) <= finDate);
      }
      
      setRecords(filteredData as Bitacora[]);
    } catch (error) {
      console.error("Error al cargar accesos de bitácora", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar y cuando cambian los filtros
  useEffect(() => {
    // Podrías agregar un "debounce" aquí para el propertyFilter si quisieras
    loadData();
  }, [propertyFilter, typeFilter, sortOrder, fechaInicio, fechaFin, page]);

  return (
    <div className="container mx-auto p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hitorial de Accesos (Administrador)</h1>
        <p className="text-muted-foreground text-sm mt-1">Supervisa todas las entradas y salidas de la residencia.</p>
      </div>

      <FiltrosTablaAdmin
        onSearchProperty={setPropertyFilter}
        onTypeChange={setTypeFilter}
        onSortChange={setSortOrder}
        onDateChange={(inicio: string, fin: string) => { setFechaInicio(inicio); setFechaFin(fin); }}
        onClearFilters={() => { setPropertyFilter(""); setTypeFilter("todos"); setSortOrder("desc"); setFechaInicio(""); setFechaFin(""); }}
      />
      
      <TablaAccesosAdmin 
        data={records} 
        loading={loading} 
        onRefresh={loadData} 
        meta={{
          page: page,
          total_pages: 5, // Forzamos 5 páginas para que sea visible visualmente
          total: 50 // Un total de registros inventado
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
