"use client";

// Componentes UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Icons
import {
  QrCode,
  ListCheck,
  NotebookPen,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";

const accesosData = [
  {
    id: 1,
    nombre: "Juan Pérez",
    tipoPersona: "visitante",
    residenteAsociado: "María González",
    fechaEntrada: "06/05/2026 14:30",
    fechaSalida: "06/05/2026 16:45",
    metodoAcceso: "QR",
    guardiaRegistro: "Carlos Rodríguez",
    estado: "salida",
  },
  {
    id: 2,
    nombre: "María González",
    tipoPersona: "residente",
    residenteAsociado: "-",
    fechaEntrada: "06/05/2026 08:15",
    fechaSalida: "-",
    metodoAcceso: "lista",
    guardiaRegistro: "Ana López",
    estado: "entrada",
  },
  {
    id: 3,
    nombre: "Roberto Silva",
    tipoPersona: "empleado doméstico",
    residenteAsociado: "Ana López",
    fechaEntrada: "06/05/2026 07:00",
    fechaSalida: "06/05/2026 15:00",
    metodoAcceso: "manual",
    guardiaRegistro: "Miguel Torres",
    estado: "salida",
  },
  {
    id: 4,
    nombre: "Distribuidora ABC",
    tipoPersona: "proveedor",
    residenteAsociado: "Juan Pérez",
    fechaEntrada: "06/05/2026 10:30",
    fechaSalida: "06/05/2026 11:15",
    metodoAcceso: "lista",
    guardiaRegistro: "Pedro Gómez",
    estado: "salida",
  },
  {
    id: 5,
    nombre: "Laura Martínez",
    tipoPersona: "visitante",
    residenteAsociado: "Pedro Martínez",
    fechaEntrada: "07/05/2026 09:45",
    fechaSalida: "-",
    metodoAcceso: "QR",
    guardiaRegistro: "Carlos Rodríguez",
    estado: "entrada",
  },
];

const getTipoPersonaColor = (tipo: string) => {
  const colors: Record<string, string> = {
    visitante: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    residente: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    "empleado doméstico": "bg-teal-100 text-teal-800 hover:bg-teal-100",
    proveedor: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  };
  return colors[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
};

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, string> = {
    entrada: "bg-green-100 text-green-800",
    salida: "bg-red-100 text-red-800",
  };
  return variants[estado] || "bg-gray-100 text-gray-800";
};

export function TablaAccesosGuardia() {
  return (
    <div className="space-y-4">
      <Table className="border rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Residente asociado</TableHead>
            <TableHead className="text-center">
              Fecha y hora de entrada
            </TableHead>
            <TableHead className="text-center">
              Fecha y hora de salida
            </TableHead>
            <TableHead className="text-center">Método de acceso</TableHead>
            <TableHead className="text-center">Guardia que registró</TableHead>
            <TableHead className="text-center">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accesosData.map((acceso) => (
            <TableRow key={acceso.id} className="py-8">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                      {acceso.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{acceso.nombre}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={getTipoPersonaColor(acceso.tipoPersona)}>
                  {acceso.tipoPersona}
                </Badge>
              </TableCell>
              <TableCell>
                {acceso.residenteAsociado !== "-" ? (
                  <div className="flex items-center  gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                        {acceso.residenteAsociado
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {acceso.residenteAsociado}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{acceso.fechaEntrada.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{acceso.fechaEntrada.split(" ")[1]}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {acceso.fechaSalida === "-" ? (
                  <span className="text-muted-foreground text-sm">-</span>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{acceso.fechaSalida.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{acceso.fechaSalida.split(" ")[1]}</span>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {acceso.metodoAcceso === "QR" ? (
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5" />
                    <span>QR</span>
                  </div>
                ) : acceso.metodoAcceso === "lista" ? (
                  <div className="flex items-center justify-center gap-2">
                    <ListCheck className="h-5 w-5" />
                    <span>Lista</span>
                  </div>
                ) : acceso.metodoAcceso === "manual" ? (
                  <div className="flex items-center justify-center gap-2">
                    <NotebookPen className="h-5 w-5" />
                    <span>Manual</span>
                  </div>
                ) : (
                  <span>{acceso.metodoAcceso}</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <ShieldCheck />
                  <span>{acceso.guardiaRegistro}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge className={getEstadoBadge(acceso.estado)}>
                  {acceso.estado}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
