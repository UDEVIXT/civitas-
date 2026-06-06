"use client"

// Components UI
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"

interface Persona {
  id: string;
  nombre: string;
  rol: string;
  fechaSolicitud: string;
  estado: string;
}

interface SolicitudesRowProps {
    persona: Persona;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
}

export function SolicitudesRow({ persona, isSelected, onSelect }: SolicitudesRowProps) {
    return (
        <TableRow key={persona.nombre} data-state={isSelected ? "selected" : undefined}>
            <TableCell className="flex justify-center whitespace-nowrap">
                <Checkbox
                  id={`row-${persona.id}-checkbox`}
                  name={`row-${persona.id}-checkbox`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onSelect(persona.id, checked === true)
                  }
                />
            </TableCell>
            <TableCell className="font-medium whitespace-nowrap">{persona.nombre}</TableCell>
            <TableCell className="flex justify-center whitespace-nowrap">
                <Badge className={persona.rol === "Administrador" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>{persona.rol}</Badge>
            </TableCell>
            <TableCell className="text-center whitespace-nowrap">
                {new Date(persona.fechaSolicitud).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })} {new Date(persona.fechaSolicitud).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </TableCell>
            <TableCell className="flex justify-center gap-2 whitespace-nowrap">
                <Button className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200">
                    Aceptar
                </Button>
                <Button variant="destructive" className="cursor-pointer">
                    Rechazar
                </Button>
            </TableCell>
        </TableRow>
    )
}
