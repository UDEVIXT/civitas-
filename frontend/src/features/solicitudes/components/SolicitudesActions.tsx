"use client"

import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"

interface SolicitudesActionsProps {
    selectedCount: number
    searchQuery: string
    onSearchChange: (query: string) => void
    onAceptarMasivo: () => void
}

export function SolicitudesActions({ selectedCount, searchQuery, onSearchChange, onAceptarMasivo }: SolicitudesActionsProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-0 max-w-full">
            <InputGroup className="md:max-w-sm w-full">
                <InputGroupInput
                    id="input-group-url"
                    placeholder="Buscar solicitud por nombre..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>

            <Button
                className="cursor-pointer"
                disabled={selectedCount === 0}
                onClick={onAceptarMasivo}
            >
                Aceptar todos ({selectedCount})
            </Button>
        </div>
    )
}
