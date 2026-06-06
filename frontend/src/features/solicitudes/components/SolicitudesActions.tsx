"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"

interface SolicitudesActionsProps {
    personasCount: number
    selectedCount: number
    searchQuery: string
    onSearchChange: (query: string) => void
}

export function SolicitudesActions({ personasCount, selectedCount, searchQuery, onSearchChange }: SolicitudesActionsProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-0 max-w-full">
            <InputGroup className="md:max-w-sm w-full">
                <InputGroupInput
                    id="input-group-url"
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>

            <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" className="cursor-pointer">
                    {selectedCount === personasCount ? `Aceptar todos(${personasCount})` : selectedCount > 0 ? `Aceptar seleccionados(${selectedCount})` : `Aceptar todos(${personasCount})`}
                </Button>
                <Button variant="destructive" className="cursor-pointer">
                    {selectedCount === personasCount ? `Rechazar todos(${personasCount})` : selectedCount > 0 ? `Rechazar seleccionados(${selectedCount})` : `Rechazar todos(${personasCount})`}
                </Button>
            </div>
        </div>
    )
}
