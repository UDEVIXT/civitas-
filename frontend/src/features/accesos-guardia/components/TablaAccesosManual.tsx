"use client";

import React, { useState, useMemo, useEffect } from "react";

import { FileText, ArrowUpDown, ChevronDown, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { ScanLine, ListFilter,Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAccesosPreautorizados } from "../hooks/useAccesosPreautorizados";
import { AccesoPreautorizado } from "../api/accesos";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"

type TipoDisplay = "Visitante" | "Proveedor" | "Empleado doméstico";
type EstadoQR = "Activo" | "Expirado";

const TIPO_DISPLAY: Record<"Visitante" | "Proveedor" | "Empleado", TipoDisplay> = {
  Visitante: "Visitante",
  Proveedor: "Proveedor",
  Empleado: "Empleado doméstico",
};

function getEstadoQR(fechaExpiracion: string): EstadoQR {
  return new Date(fechaExpiracion) > new Date() ? "Activo" : "Expirado";
}

const tipoVisitaBadge: Record<TipoDisplay, { label: string; className: string }> = {
  Visitante: { label: "Visitante", className: "bg-blue-100 text-blue-600 hover:bg-blue-100 border-0 rounded-full" },
  "Empleado doméstico": { label: "Empleado doméstico", className: "bg-teal-100 text-teal-600 hover:bg-teal-100 border-0 rounded-full" },
  Proveedor: { label: "Proveedor", className: "bg-orange-100 text-orange-500 hover:bg-orange-100 border-0 rounded-full" },
};

const estadoQRBadge: Record<EstadoQR, { label: string; className: string }> = {
  Activo: { label: "Activo", className: "bg-green-100 text-green-800 hover:bg-green-100 border-0" },
  Expirado: { label: "Expirado", className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-0" },
};

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const PAGE_SIZE = 8;

export function TablaAccesosManual() {
  const { accesos, loading, error, refetch } = useAccesosPreautorizados();
  const [notaModal, setNotaModal] = useState<AccesoPreautorizado | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");

  const [filterVisitantes, setFilterVisitantes] = React.useState(false)
  const [filterProveedores, setFilterProveedores] = React.useState(false)
  const [filterEmpleados, setFilterEmpleados] = React.useState(false)

  const filteredAccesos = useMemo(() => {
    return accesos.filter((acceso) => {
      const hasAnyFilter = filterVisitantes || filterProveedores || filterEmpleados;
      const tipoMatch = !hasAnyFilter || 
        (acceso.tipo === "Visitante" && filterVisitantes) ||
        (acceso.tipo === "Proveedor" && filterProveedores) ||
        (acceso.tipo === "Empleado" && filterEmpleados);
      
      const searchMatch = searchTerm === "" || 
        acceso.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      return tipoMatch && searchMatch;
    });
  }, [accesos, filterVisitantes, filterProveedores, filterEmpleados, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAccesos.length / PAGE_SIZE));

  const paginados = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAccesos.slice(start, start + PAGE_SIZE);
  }, [filteredAccesos, currentPage]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterVisitantes, filterProveedores, filterEmpleados, searchTerm]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card flex items-center justify-center py-16 text-sm text-muted-foreground">
        Cargando accesos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-4 shrink-0 gap-1">
          <RefreshCw className="h-3.5 w-3.5" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between">
        <InputGroup className="max-w-sm">
          <InputGroupInput 
            id="input-group-url" 
            placeholder="Buscar por nombre..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <ListFilter /> Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Tipos de visitas</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={filterVisitantes}
                  onCheckedChange={setFilterVisitantes}
                  className="cursor-pointer"
                >
                  Visitantes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterProveedores}
                  onCheckedChange={setFilterProveedores}
                  className="cursor-pointer"
                >
                  Proveedores
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterEmpleados}
                  onCheckedChange={setFilterEmpleados}
                  className="cursor-pointer"
                >
                  Empleados domésticos
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="/servicios-repartidores/guardia">
            <Button className="cursor-pointer text-foreground">
              <ScanLine /> Escanear QR
            </Button>
          </a>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-35">Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="hidden sm:table-cell min-w-32.5">Propiedad</TableHead>
              <TableHead className="hidden lg:table-cell">
                <span className="flex items-center gap-1">Fecha esperada de llegada <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <span className="flex items-center gap-1">Fecha esperada de salida <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead>Estado QR</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccesos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                  No hay accesos preautorizados registrados.
                </TableCell>
              </TableRow>
            ) : (
              paginados.map((acceso) => {
                const tipoDisplay = TIPO_DISPLAY[acceso.tipo];
                const estadoQR = getEstadoQR(acceso.fecha_expiracion);
                const qrBadge = estadoQRBadge[estadoQR];
                const tipoBadge = tipoVisitaBadge[tipoDisplay];
                const isExpanded = expandedId === acceso.id_acceso_preautorizado;
                return (
                  <React.Fragment key={acceso.id_acceso_preautorizado}>
                    <TableRow
                      className="align-middle cursor-pointer sm:cursor-default"
                      onClick={() => setExpandedId(isExpanded ? null : acceso.id_acceso_preautorizado)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight">{acceso.nombre}</p>
                            <div className="sm:hidden mt-0.5">
                              <span className="text-xs font-medium">{acceso.propiedad}</span>
                              <span className="text-xs text-muted-foreground"> · {acceso.nombre_residente}</span>
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground shrink-0 sm:hidden transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <Badge className={tipoBadge.className}>{tipoBadge.label}</Badge>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        <p className="text-sm font-medium">{acceso.propiedad}</p>
                        <p className="text-xs text-muted-foreground">{acceso.nombre_residente}</p>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-sm">
                        {acceso.fecha_llegada ? (
                          <>
                            <p>{formatFecha(acceso.fecha_llegada)}</p>
                            <p className="text-xs text-muted-foreground">{formatHora(acceso.fecha_llegada)}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin registrar</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-sm">
                        {acceso.fecha_salida ? (
                          <>
                            <p>{formatFecha(acceso.fecha_salida)}</p>
                            <p className="text-xs text-muted-foreground">{formatHora(acceso.fecha_salida)}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin registrar</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={qrBadge.className}>{qrBadge.label}</Badge>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-center">
                        {acceso.tiene_nota ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 gap-1 px-2"
                            onClick={(e) => { e.stopPropagation(); setNotaModal(acceso); }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Ver nota
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="sm:hidden bg-muted/30">
                        <TableCell colSpan={8} className="px-4 pb-3 pt-0">
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Tipo</span>
                              <Badge className={tipoBadge.className}>{tipoBadge.label}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Llegada</span>
                              <span>
                                {acceso.fecha_llegada
                                  ? `${formatFecha(acceso.fecha_llegada)} ${formatHora(acceso.fecha_llegada)}`
                                  : <span className="italic text-muted-foreground">Sin registrar</span>}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Salida</span>
                              <span>
                                {acceso.fecha_salida
                                  ? `${formatFecha(acceso.fecha_salida)} ${formatHora(acceso.fecha_salida)}`
                                  : <span className="italic text-muted-foreground">Sin registrar</span>}
                              </span>
                            </div>
                            {acceso.tiene_nota && (
                              <div className="pt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setNotaModal(acceso)}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  Ver nota del residente
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground mt-3">
        <span className="text-center sm:text-left">
          {`Mostrando ${filteredAccesos.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredAccesos.length)} de ${filteredAccesos.length} registros`}
        </span>
        <div className="flex items-center gap-2 justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Anterior</span>
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span>Página</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const n = parseInt(pageInput, 10);
                  if (!isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                  else setPageInput(String(currentPage));
                }
              }}
              onBlur={() => {
                const n = parseInt(pageInput, 10);
                if (!isNaN(n) && n >= 1 && n <= totalPages) setCurrentPage(n);
                else setPageInput(String(currentPage));
              }}
              className="w-12 h-8 text-center rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span>de {totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="hidden xs:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={!!notaModal} onOpenChange={(open) => { if (!open) setNotaModal(null); }}>
        <DialogContent className="sm:max-w-md p-7">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Nota del residente
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm pt-1">
                <p>
                  Instrucciones registradas para el acceso de{" "}
                  <strong>{notaModal?.nombre}</strong>, propiedad{" "}
                  <strong>{notaModal?.propiedad}</strong>.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm leading-relaxed bg-muted/50 rounded-md px-4 py-3">
              {notaModal?.informacion_general ?? "Sin contenido registrado."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
