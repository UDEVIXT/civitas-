"use client"

import * as React from "react"

// API
import { getSolicitudes } from "../api/solicitud"
import type { Solicitud } from "../schema/solicitudSchema"

// My components
import { SolicitudesHeader } from "./SolicitudesHeader"
import { SolicitudesActions } from "./SolicitudesActions"
import { SolicitudesTable } from "./SolicitudesTable"

interface Persona {
  id: string;
  nombre: string;
  rol: string;
  fechaSolicitud: string;
  estado: string;
}

export function SolicitudesView() {

    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
    const [personas, setPersonas] = React.useState<Persona[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [currentPage, setCurrentPage] = React.useState<number>(1)
    const itemsPerPage = 10

    React.useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const data = await getSolicitudes()
                const mappedData: Persona[] = data.map((solicitud: Solicitud) => ({
                    id: solicitud.id_solicitud,
                    nombre: solicitud.nombre,
                    rol: solicitud.rol_solicitado,
                    fechaSolicitud: solicitud.createdAt,
                    estado: solicitud.estatus_solicitud,
                }))
                setPersonas(mappedData)
            } catch (err) {
                setError("Error al cargar las solicitudes")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchSolicitudes()
    }, [])

    const filteredPersonas = personas.filter(persona =>
        persona.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPersonas = filteredPersonas.slice(startIndex, endIndex)

    const selectAll = selectedRows.size === paginatedPersonas.length
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(paginatedPersonas.map((row) => row.id)))
        } else {
            setSelectedRows(new Set())
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedRows(new Set())
    }

    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])
    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows)

        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }

        setSelectedRows(newSelected)
    }

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4 sm:px-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Cargando solicitudes...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-6 px-4 sm:px-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6 flex flex-col gap-6">
            <SolicitudesHeader />
            <SolicitudesActions
                personasCount={filteredPersonas.length}
                selectedCount={selectedRows.size}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <SolicitudesTable
                personas={paginatedPersonas}
                selectedRows={selectedRows}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectRow={handleSelectRow}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}