"use client";
import { useState, useEffect, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Clock,
  Calendar,
  Plus,
  AlertTriangle,
} from "lucide-react";

import { FiltrosIncidentes } from "./FiltrosIncidentes";
import { Incidente } from "@/services/incidentes.service";

interface FiltrosState {
  estado?: 'Pendiente' | 'En proceso' | 'Resuelto' | 'Todos';
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  ordenarPor?: 'reciente' | 'antiguo';
}

interface TablaEstadoIncidentesProps {
  data?: Incidente[];
}

const getPrioridadColor = (prioridad: string) => {
  const colors: Record<string, string> = {
    "Baja": "bg-green-100 text-green-800 hover:bg-green-100",
    "Media": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "Alta": "bg-red-100 text-red-800 hover:bg-red-100",
  };
  return colors[prioridad] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const getTipoColor = (tipo: string) => {
  const colors: Record<string, string> = {
    "Queja": "bg-red-100 text-red-800 hover:bg-red-100",
    "Incidencia": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "Sugerencia": "bg-green-100 text-green-800 hover:bg-green-100",
  };
  return colors[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const getEstadoColor = (estado: string) => {
  const colors: Record<string, string> = {
    "Pendiente": "bg-orange-100 text-orange-800 hover:bg-orange-100",
    "En proceso": "bg-blue-100 text-blue-800 hover:bg-blue-100",
    "Resuelto": "bg-green-100 text-green-800 hover:bg-green-100",
  };
  return colors[estado] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const mockData: Incidente[] = [
  {
    id: 1,
    titulo: "Fuga de agua",
    tipo: "Queja",
    descripcionBreve: "Fuga en tubería principal del baño del apartamento 205",
    lugar: "Apartamento 205",
    fechaHoraReporte: "07/05/2026 09:30",
    estadoActual: "Pendiente",
    prioridad: "Alta",
    fechaUltimaActualizacion: "07/05/2026 10:00",
    reportadoAnonimamente: false,
  },
  {
    id: 2,
    titulo: "Luces comunes",
    tipo: "Incidencia",
    descripcionBreve: "Las luces del pasillo principal no funcionan correctamente",
    lugar: "Pasillo principal",
    fechaHoraReporte: "06/05/2026 14:15",
    estadoActual: "En proceso",
    prioridad: "Media",
    fechaUltimaActualizacion: "06/05/2026 15:30",
    reportadoAnonimamente: true,
  },
  {
    id: 3,
    titulo: "Puerta principal",
    tipo: "Incidencia",
    descripcionBreve: "La cerradura no responde correctamente",
    lugar: "Acceso principal",
    fechaHoraReporte: "05/05/2026 08:00",
    estadoActual: "Resuelto",
    prioridad: "Alta",
    fechaUltimaActualizacion: "05/05/2026 12:00",
    reportadoAnonimamente: false,
  },
  {
    id: 4,
    titulo: "Aire acondicionado",
    tipo: "Queja",
    descripcionBreve: "Ruido extraño en unidad del apartamento 101",
    lugar: "Apartamento 101",
    fechaHoraReporte: "07/05/2026 11:45",
    estadoActual: "Pendiente",
    prioridad: "Baja",
    fechaUltimaActualizacion: "07/05/2026 11:45",
    reportadoAnonimamente: true,
  },
  {
    id: 5,
    titulo: "Sistema de alarmas",
    tipo: "Sugerencia",
    descripcionBreve: "Sugerencia para mejorar sistema de alarmas contra incendios",
    lugar: "Áreas comunes",
    fechaHoraReporte: "04/05/2026 16:20",
    estadoActual: "En proceso",
    prioridad: "Media",
    fechaUltimaActualizacion: "05/05/2026 09:15",
    reportadoAnonimamente: false,
  },
  {
    id: 6,
    titulo: "Ascensor averiado",
    tipo: "Incidencia",
    descripcionBreve: "El ascensor principal se detiene entre pisos",
    lugar: "Ascensor principal",
    fechaHoraReporte: "07/05/2026 07:00",
    estadoActual: "Pendiente",
    prioridad: "Alta",
    fechaUltimaActualizacion: "07/05/2026 08:30",
    reportadoAnonimamente: false,
  },
  {
    id: 7,
    titulo: "Jardines descuidados",
    tipo: "Queja",
    descripcionBreve: "Las áreas verdes necesitan mantenimiento urgente",
    lugar: "Jardines del edificio",
    fechaHoraReporte: "06/05/2026 10:20",
    estadoActual: "En proceso",
    prioridad: "Media",
    fechaUltimaActualizacion: "06/05/2026 11:45",
    reportadoAnonimamente: true,
  },
  {
    id: 8,
    titulo: "Wi-Fi lento",
    tipo: "Queja",
    descripcionBreve: "La conexión a internet es muy lenta en las noches",
    lugar: "Áreas comunes",
    fechaHoraReporte: "05/05/2026 20:15",
    estadoActual: "Pendiente",
    prioridad: "Media",
    fechaUltimaActualizacion: "05/05/2026 20:15",
    reportadoAnonimamente: false,
  },
  {
    id: 9,
    titulo: "Piscina sucia",
    tipo: "Incidencia",
    descripcionBreve: "El agua de la piscina está turbia y necesita limpieza",
    lugar: "Área de piscina",
    fechaHoraReporte: "04/05/2026 12:30",
    estadoActual: "Resuelto",
    prioridad: "Baja",
    fechaUltimaActualizacion: "05/05/2026 09:00",
    reportadoAnonimamente: true,
  },
  {
    id: 10,
    titulo: "Estacionamiento sin iluminación",
    tipo: "Incidencia",
    descripcionBreve: "Las luces del estacionamiento no funcionan",
    lugar: "Estacionamiento subterráneo",
    fechaHoraReporte: "03/05/2026 18:45",
    estadoActual: "En proceso",
    prioridad: "Media",
    fechaUltimaActualizacion: "04/05/2026 10:20",
    reportadoAnonimamente: false,
  },
];

export function TablaEstadoIncidentes({ data }: TablaEstadoIncidentesProps) {
  const sourceData = data ?? mockData;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<FiltrosState>({
    estado: 'Todos',
    busqueda: '',
    fechaDesde: undefined,
    fechaHasta: undefined,
    ordenarPor: 'reciente',
  });

  const filteredIncidentes = useMemo(() => {
    let filtered = sourceData;

    if (filters.estado && filters.estado !== 'Todos') {
      filtered = filtered.filter(incidente => incidente.estadoActual === filters.estado);
    }

    if (filters.busqueda) {
      filtered = filtered.filter(incidente =>
        incidente.titulo.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        incidente.descripcionBreve.toLowerCase().includes(filters.busqueda!.toLowerCase()) ||
        incidente.lugar.toLowerCase().includes(filters.busqueda!.toLowerCase())
      );
    }

    if (filters.fechaDesde) {
      filtered = filtered.filter(incidente => {
        const [fechaPart] = incidente.fechaHoraReporte.split(' ');
        const [dia, mes, anio] = fechaPart.split('/');
        const fechaIncidente = new Date(`${anio}-${mes}-${dia}`);
        const fechaDesde = new Date(filters.fechaDesde!);
        return fechaIncidente >= fechaDesde;
      });
    }

    if (filters.fechaHasta) {
      filtered = filtered.filter(incidente => {
        const [fechaPart] = incidente.fechaHoraReporte.split(' ');
        const [dia, mes, anio] = fechaPart.split('/');
        const fechaIncidente = new Date(`${anio}-${mes}-${dia}`);
        const fechaHasta = new Date(filters.fechaHasta!);
        return fechaIncidente <= fechaHasta;
      });
    }

    filtered.sort((a, b) => {
      const fechaA = new Date(a.fechaHoraReporte);
      const fechaB = new Date(b.fechaHoraReporte);
      if (filters.ordenarPor === 'reciente') {
        return fechaB.getTime() - fechaA.getTime();
      } else if (filters.ordenarPor === 'antiguo') {
        return fechaA.getTime() - fechaB.getTime();
      }
      return 0;
    });

    return filtered;
  }, [sourceData, filters.estado, filters.busqueda, filters.fechaDesde, filters.fechaHasta, filters.ordenarPor]);

  const paginatedIncidentes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredIncidentes.slice(startIndex, endIndex);
  }, [filteredIncidentes, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredIncidentes.length / pageSize);

  useEffect(() => {
    const fetchIncidentes = async () => {
      try {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('Error fetching incidentes:', err);
        setError('Error al cargar los incidentes');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidentes();
  }, []);

  const handleFilterChange = (newFilters: FiltrosState) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando incidentes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <FiltrosIncidentes
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="text-sm text-muted-foreground">
          Mostrando {paginatedIncidentes.length} de {filteredIncidentes.length} incidentes
        </div>
      </div>

      {paginatedIncidentes.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">No se encontraron incidentes</p>
        </div>
      ) : (
        <Table className="border rounded-lg">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Lugar</TableHead>
              <TableHead className="text-center">Fecha reporte</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Prioridad</TableHead>
              <TableHead className="text-center">Última actualización</TableHead>
              <TableHead className="text-center">Anónimo</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedIncidentes.map((incidente) => (
              <TableRow key={incidente.id} className="py-8">
                <TableCell className="font-medium">{incidente.titulo}</TableCell>
                <TableCell>
                  <Badge className={getTipoColor(incidente.tipo)}>
                    {incidente.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <span className="text-sm">{incidente.descripcionBreve}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{incidente.lugar}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{incidente.fechaHoraReporte.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{incidente.fechaHoraReporte.split(" ")[1]}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getEstadoColor(incidente.estadoActual)}>
                    {incidente.estadoActual}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={getPrioridadColor(incidente.prioridad)}>
                    {incidente.prioridad}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{incidente.fechaUltimaActualizacion.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{incidente.fechaUltimaActualizacion.split(" ")[1]}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {incidente.reportadoAnonimamente ? (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      Sí
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      No
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedId(incidente.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
              disabled={currentPage === (totalPages || 1)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}