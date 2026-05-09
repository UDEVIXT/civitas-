"use client";
import React, { useState } from "react";

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
import { ModalSalidaProveedor } from "@/components/layout/modals/guardia/registrosalida";
import { Calendar, Clock, QrCode, ClipboardList } from "lucide-react";
import { Bitacora } from "@/services/bitacora.service";

interface TablaAccesosAdminProps {
  data: Bitacora[];
  loading: boolean;
  onRefresh: () => void;
}

const getTipoBadge = (tipo: string) => {
  const lower = tipo.toLowerCase();
  if (lower.includes("visitante")) return "bg-blue-100 text-blue-800";
  if (lower.includes("residente")) return "bg-purple-100 text-purple-800";
  if (lower.includes("proveedor")) return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-800";
};

export function TablaAccesosAdmin({ data, loading, onRefresh }: TablaAccesosAdminProps) {
  const [selectedAcceso, setSelectedAcceso] = useState<Bitacora | null>(null);

  // CA008: Verificar si la persona lleva demasiado tiempo dentro (ej. > 12h)
  const isExceeded = (entryTime: string, exitTime?: string) => {
    if (exitTime) return false;
    const entry = new Date(entryTime).getTime();
    const now = new Date().getTime();
    return (now - entry) > 12 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-4">
      <Table className="border rounded-lg">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Visitante</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="text-center">Propiedad</TableHead>
            <TableHead className="text-center">Entrada</TableHead>
            <TableHead className="text-center">Salida</TableHead>
            <TableHead className="text-center">Motivo</TableHead>
            <TableHead className="text-center">Notas Guardia</TableHead>
            <TableHead className="text-center">QR</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                Cargando registros...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                No hay registros que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            data.map((acceso) => (
              <TableRow key={acceso.id} className="py-4">
                <TableCell className="font-medium">{acceso.visitorName}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`hover:opacity-80 ${getTipoBadge(acceso.visitorType)}`}>
                    {acceso.visitorType}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium">{acceso.propertyId}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(acceso.entryTime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(acceso.entryTime).toLocaleTimeString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {acceso.exitTime ? (
                    <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(acceso.exitTime).toLocaleTimeString()}</span>
                    </div>
                  ) : (
                        <div className="flex flex-col gap-1 items-center">
                          <Badge variant="outline" className="text-green-600 border-green-200">En curso</Badge>
                          {isExceeded(acceso.entryTime, acceso.exitTime) && (
                            <Badge variant="destructive" className="text-[10px]">Tiempo excedido</Badge>
                          )}
                        </div>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm">{acceso.visitReason}</TableCell>
                <TableCell className="text-center text-sm max-w-[150px] truncate" title={acceso.guardNotes}>
                  {acceso.guardNotes || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {acceso.qrCode ? <QrCode className="h-5 w-5 mx-auto text-muted-foreground" /> : <ClipboardList className="h-5 w-5 mx-auto text-muted-foreground" />}
                </TableCell>
                    <TableCell className="text-center">
                      {!acceso.exitTime && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedAcceso(acceso)}
                        >
                          Dar Salida
                        </Button>
                      )}
                    </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

          <ModalSalidaProveedor
            isOpen={!!selectedAcceso}
            onClose={() => setSelectedAcceso(null)}
            onSuccess={() => {
              setSelectedAcceso(null);
              onRefresh();
            }}
            accesoId={selectedAcceso?.id}
            visitorName={selectedAcceso?.visitorName}
          />
    </div>
  );
}