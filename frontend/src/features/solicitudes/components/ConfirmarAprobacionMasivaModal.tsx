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
import { Button } from "@/components/ui/button"
import { aprobarSolicitudesMasivo } from "../api/solicitud"

interface ConfirmarAprobacionMasivaModalProps {
  open: boolean
  cantidad: number
  ids: string[]
  onClose: () => void
  onProcesado: () => void
}

export function ConfirmarAprobacionMasivaModal({
  open,
  cantidad,
  ids,
  onClose,
  onProcesado,
}: ConfirmarAprobacionMasivaModalProps) {
  const [procesando, setProcesando] = React.useState(false)

  const confirmar = async () => {
    setProcesando(true)
    try {
      const resultado = await aprobarSolicitudesMasivo(ids)
      if (resultado.fallidas.length === 0) {
        toast.success(`Se aprobaron ${resultado.aprobadas} cuentas correctamente.`)
      } else {
        toast.warning(`Se aprobaron ${resultado.aprobadas} de ${resultado.total} solicitudes.`, {
          description: `${resultado.fallidas.length} ya habían sido procesadas o no se pudieron completar.`,
        })
      }
      onProcesado()
    } catch (error) {
      toast.error("No se pudo completar la aprobación masiva", {
        description: axios.isAxiosError(error)
          ? "Ocurrió un problema técnico. Intenta nuevamente."
          : "Ocurrió un error inesperado.",
      })
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !procesando && !value && onClose()}>
      <DialogContent className="w-[95vw] max-w-sm rounded-xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>Confirmar aprobación masiva</DialogTitle>
          <DialogDescription>
            Estás a punto de crear{" "}
            <span className="font-semibold text-foreground">{cantidad}</span>{" "}
            {cantidad === 1 ? "cuenta" : "cuentas"} con los roles solicitados. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" className="cursor-pointer" onClick={onClose} disabled={procesando}>
            Cancelar
          </Button>
          <Button className="cursor-pointer" onClick={confirmar} disabled={procesando}>
            {procesando ? "Procesando..." : `Aceptar todos (${cantidad})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
