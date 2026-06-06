"use client"

// Components UI
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// My components
import { SolicitudesRow } from "./SolicitudesRow"
import { Pagination } from "./Pagination"

interface Persona {
  id: string;
  nombre: string;
  rol: string;
  fechaSolicitud: string;
  estado: string;
}

interface SolicitudesTableProps {
    personas: Persona[];
    selectedRows: Set<string>;
    selectAll: boolean;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function SolicitudesTable({ personas, selectedRows, selectAll, onSelectAll, onSelectRow, currentPage, totalPages, onPageChange }: SolicitudesTableProps) {
    return (
        <ScrollArea className="md:w-full w-70 rounded-xl border border-foreground-muted">  
            <Table>
                <TableHeader className="bg-muted">
                    <TableRow>
                        <TableHead className="flex justify-center items-center whitespace-nowrap">
                            <Checkbox
                              id="select-all-checkbox"
                              name="select-all-checkbox"
                              checked={selectAll}
                              onCheckedChange={onSelectAll}
                            />
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Nombre del usuario</TableHead>
                        <TableHead className="text-center whitespace-nowrap">Rol solicitado</TableHead>
                        <TableHead className="text-center whitespace-nowrap">Fecha y hora de solicitud</TableHead>
                        <TableHead className="text-center whitespace-nowrap">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {personas.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                            <p className="text-muted-foreground">Aún sin solicitudes</p>
                        </TableCell>
                    </TableRow>
                  ) : (
                    personas.map((persona) => (
                        <SolicitudesRow
                          key={persona.nombre}
                          persona={persona}
                          isSelected={selectedRows.has(persona.id)}
                          onSelect={onSelectRow}
                        />
                    ))
                  )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={onPageChange}
                            />
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
