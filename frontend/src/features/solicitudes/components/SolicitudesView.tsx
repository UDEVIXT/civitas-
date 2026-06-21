"use client"

import * as React from "react"

// API
import { getSolicitudes } from "../api/solicitud"
import type { Solicitud } from "../schema/solicitudSchema"
import type { PersonaSolicitud } from "../types/persona"

// My components
import { SolicitudesHeader } from "./SolicitudesHeader"
import { SolicitudesActions } from "./SolicitudesActions"
import { SolicitudesTable } from "./SolicitudesTable"
import { SolicitudDetalleModal } from "./SolicitudDetalleModal"
import { ConfirmarAprobacionMasivaModal } from "./ConfirmarAprobacionMasivaModal"

function mapearSolicitud(solicitud: Solicitud): PersonaSolicitud {
    return {
        id: solicitud.id_solicitud,
        nombre: solicitud.nombre,
        rol: solicitud.rol_solicitado,
        correo: solicitud.correo,
        telefono: solicitud.telefono ?? null,
        genero: solicitud.genero,
        fechaNacimiento: solicitud.fecha_nacimiento,
        fechaSolicitud: solicitud.createdAt,
        estado: solicitud.estatus_solicitud,
        numeroEmpleado: solicitud.numero_empleado ?? null,
        tieneCredencialFrente: !!solicitud.credencial_frente_key,
        tieneCredencialReverso: !!solicitud.credencial_reverso_key,
    }
}

// Bandeja de pendientes: solo se muestran solicitudes que aún no fueron resueltas.
async function obtenerSolicitudesPendientes(): Promise<PersonaSolicitud[]> {
    const data = await getSolicitudes()
    return data
        .filter((solicitud) => solicitud.estatus_solicitud === "Pendiente")
        .map(mapearSolicitud)
}

export function SolicitudesView() {

    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
    const [personas, setPersonas] = React.useState<PersonaSolicitud[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState<string>("")
    const [currentPage, setCurrentPage] = React.useState<number>(1)
    const [detalleSeleccionado, setDetalleSeleccionado] = React.useState<PersonaSolicitud | null>(null)
    const [confirmMasivoAbierto, setConfirmMasivoAbierto] = React.useState(false)
    const itemsPerPage = 10

    const cargarSolicitudes = () => {
        setLoading(true)
        obtenerSolicitudesPendientes()
            .then((pendientes) => {
                setPersonas(pendientes)
                setError(null)
            })
            .catch((err) => {
                setError("No se pudieron cargar las solicitudes. Verifica tu conexión e intenta nuevamente.")
                console.error(err)
            })
            .finally(() => setLoading(false))
    }

    React.useEffect(() => {
        obtenerSolicitudesPendientes()
            .then((pendientes) => {
                setPersonas(pendientes)
                setError(null)
            })
            .catch((err) => {
                setError("No se pudieron cargar las solicitudes. Verifica tu conexión e intenta nuevamente.")
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    const filteredPersonas = personas.filter(persona =>
        persona.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredPersonas.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPersonas = filteredPersonas.slice(startIndex, endIndex)

    const selectAll =
        paginatedPersonas.length > 0 && paginatedPersonas.every((row) => selectedRows.has(row.id))

    const handleSelectAll = (checked: boolean) => {
        const nuevaSeleccion = new Set(selectedRows)
        paginatedPersonas.forEach((row) => {
            if (checked) {
                nuevaSeleccion.add(row.id)
            } else {
                nuevaSeleccion.delete(row.id)
            }
        })
        setSelectedRows(nuevaSeleccion)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
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

    const handleProcesada = () => {
        setDetalleSeleccionado(null)
        setSelectedRows(new Set())
        cargarSolicitudes()
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
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <p className="text-destructive">{error}</p>
                    <button
                        type="button"
                        className="cursor-pointer text-sm font-medium text-primary underline-offset-4 hover:underline"
                        onClick={cargarSolicitudes}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6 flex flex-col gap-6">
            <SolicitudesHeader />
            <SolicitudesActions
                selectedCount={selectedRows.size}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAceptarMasivo={() => setConfirmMasivoAbierto(true)}
            />
            <SolicitudesTable
                personas={paginatedPersonas}
                selectedRows={selectedRows}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onSelectRow={handleSelectRow}
                onVerMas={setDetalleSeleccionado}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                emptyMessage={
                    personas.length === 0
                        ? "No hay solicitudes pendientes"
                        : "No se encontraron solicitudes con ese nombre"
                }
            />

            <SolicitudDetalleModal
                persona={detalleSeleccionado}
                onClose={() => setDetalleSeleccionado(null)}
                onProcesada={handleProcesada}
            />

            <ConfirmarAprobacionMasivaModal
                open={confirmMasivoAbierto}
                cantidad={selectedRows.size}
                ids={Array.from(selectedRows)}
                onClose={() => setConfirmMasivoAbierto(false)}
                onProcesado={handleProcesada}
            />
        </div>
    );
}
