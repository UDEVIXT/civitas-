"use client"

// Components UI
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// My components
import { SolicitudesRow } from "./SolicitudesRow"
import { Pagination } from "./Pagination"
import type { PersonaSolicitud } from "../types/persona"

interface SolicitudesTableProps {
    personas: PersonaSolicitud[];
    selectedRows: Set<string>;
    selectAll: boolean;
    onSelectAll: (checked: boolean) => void;
    onSelectRow: (id: string, checked: boolean) => void;
    onVerMas: (persona: PersonaSolicitud) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    emptyMessage: string;
}

export function SolicitudesTable({ personas, selectedRows, selectAll, onSelectAll, onSelectRow, onVerMas, currentPage, totalPages, onPageChange, emptyMessage }: SolicitudesTableProps) {
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
                              disabled={personas.length === 0}
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
                        <TableCell colSpan={5} className="py-12 text-center">
                            <p className="font-medium text-foreground">{emptyMessage}</p>
                        </TableCell>
                    </TableRow>
                  ) : (
                    personas.map((persona) => (
                        <SolicitudesRow
                          key={persona.id}
                          persona={persona}
                          isSelected={selectedRows.has(persona.id)}
                          onSelect={onSelectRow}
                          onVerMas={onVerMas}
                        />
                    ))
                  )}
                </TableBody>
                {personas.length > 0 && (
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
                )}
            </Table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
