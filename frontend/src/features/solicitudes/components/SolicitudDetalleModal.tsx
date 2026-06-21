"use client"

import * as React from "react"
import { toast } from "sonner"
import axios from "axios"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { aprobarSolicitud, obtenerUrlCredencial, rechazarSolicitud } from "../api/solicitud"
import type { PersonaSolicitud } from "../types/persona"

interface SolicitudDetalleModalProps {
  persona: PersonaSolicitud | null
  onClose: () => void
  onProcesada: () => void
}

function obtenerIniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase())
    .join("")
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function ImagenCredencial({
  id,
  lado,
  etiqueta,
}: {
  id: string
  lado: "frente" | "reverso"
  etiqueta: string
}) {
  const [error, setError] = React.useState(false)

  if (error) {
    return (
      <div className="flex h-24 flex-1 items-center justify-center rounded-md border border-dashed bg-muted/40 text-xs text-muted-foreground">
        No se pudo cargar
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-md border bg-muted/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={obtenerUrlCredencial(id, lado)}
        alt={`Credencial INE - ${etiqueta}`}
        className="h-24 w-full object-cover"
        onError={() => setError(true)}
      />
      <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
        {etiqueta}
      </span>
    </div>
  )
}

export function SolicitudDetalleModal({ persona, onClose, onProcesada }: SolicitudDetalleModalProps) {
  const [procesando, setProcesando] = React.useState<"aceptar" | "rechazar" | null>(null)

  const manejarConflicto = () => {
    toast.info("Solicitud ya resuelta", {
      description: "Otro administrador ya procesó esta solicitud. Se actualizó la bandeja.",
    })
    onProcesada()
  }

  const manejarAceptar = async () => {
    if (!persona) return
    setProcesando("aceptar")
    try {
      await aprobarSolicitud(persona.id)
      toast.success("Solicitud aprobada", {
        description: `Se creó la cuenta de ${persona.nombre} con el rol de ${persona.rol}.`,
      })
      onProcesada()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        manejarConflicto()
        return
      }
      toast.error("No se pudo aprobar la solicitud", {
        description: "Ocurrió un problema técnico. Intenta nuevamente.",
      })
    } finally {
      setProcesando(null)
    }
  }

  const manejarRechazar = async () => {
    if (!persona) return
    setProcesando("rechazar")
    try {
      await rechazarSolicitud(persona.id)
      toast.success("Solicitud rechazada", {
        description: `Se descartó la solicitud de ${persona.nombre}. No se creó ninguna cuenta.`,
      })
      onProcesada()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        manejarConflicto()
        return
      }
      toast.error("No se pudo rechazar la solicitud", {
        description: "Ocurrió un problema técnico. Intenta nuevamente.",
      })
    } finally {
      setProcesando(null)
    }
  }

  const ocupado = procesando !== null

  return (
    <Dialog open={!!persona} onOpenChange={(open) => !ocupado && !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-md rounded-xl p-5 sm:p-6">
        {persona && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3.5">
                <Avatar size="lg" className="size-14 ring-2 ring-primary/30 ring-offset-2 ring-offset-popover">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {obtenerIniciales(persona.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <DialogTitle className="truncate text-lg font-semibold text-primary">
                    {persona.nombre}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Solicitud #{persona.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <DialogDescription className="sr-only">
                Detalle de la solicitud de cuenta de {persona.nombre}.
              </DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 rounded-lg border bg-muted/30 p-3.5 text-sm">
              <dt className="col-span-1 text-muted-foreground">Rol solicitado</dt>
              <dd className="col-span-2">
                <Badge
                  className={
                    persona.rol === "Administrador"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {persona.rol}
                </Badge>
              </dd>

              <dt className="col-span-1 text-muted-foreground">Correo</dt>
              <dd className="col-span-2 truncate font-medium">{persona.correo}</dd>

              <dt className="col-span-1 text-muted-foreground">N° empleado</dt>
              <dd className="col-span-2 font-medium">{persona.numeroEmpleado || "Sin asignar"}</dd>

              <dt className="col-span-1 text-muted-foreground">Teléfono</dt>
              <dd className="col-span-2 font-medium">{persona.telefono || "No proporcionado"}</dd>

              <dt className="col-span-1 text-muted-foreground">Género</dt>
              <dd className="col-span-2 font-medium">{persona.genero}</dd>

              <dt className="col-span-1 text-muted-foreground">Nacimiento</dt>
              <dd className="col-span-2 font-medium">{formatearFecha(persona.fechaNacimiento)}</dd>

              <dt className="col-span-1 text-muted-foreground">Solicitada</dt>
              <dd className="col-span-2 font-medium">
                {formatearFecha(persona.fechaSolicitud)}{" "}
                {new Date(persona.fechaSolicitud).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </dl>

            {(persona.tieneCredencialFrente || persona.tieneCredencialReverso) && (
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Credencial</p>
                <div className="flex gap-2">
                  {persona.tieneCredencialFrente && (
                    <ImagenCredencial id={persona.id} lado="frente" etiqueta="Frente" />
                  )}
                  {persona.tieneCredencialReverso && (
                    <ImagenCredencial id={persona.id} lado="reverso" etiqueta="Reverso" />
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                className="cursor-pointer border-destructive text-destructive hover:bg-destructive/10"
                onClick={manejarRechazar}
                disabled={ocupado}
              >
                {procesando === "rechazar" ? "Rechazando..." : "Rechazar solicitud"}
              </Button>
              <Button className="cursor-pointer" onClick={manejarAceptar} disabled={ocupado}>
                {procesando === "aceptar" ? "Aceptando..." : "Aceptar solicitud"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
