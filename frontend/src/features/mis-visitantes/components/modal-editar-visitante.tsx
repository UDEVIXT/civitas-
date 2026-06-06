"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { ChevronDownIcon, Lock, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const editarVisitanteSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(1, "El nombre completo es obligatorio")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "Solo se permiten letras en el nombre",
    ),
  fecha_visita: z.string().min(1, "La fecha de visita es obligatoria"),
  hora_estimada: z.string().min(1, "La hora estimada es obligatoria"),
  tipo_visitante: z.string().min(1, "Selecciona el tipo de visitante"),
  motivo_visita: z.string().trim().min(1, "Especifica las notas de la visita"),
  foto: z.any().optional(),
})

type FormValues = z.infer<typeof editarVisitanteSchema>

interface ModalEditarVisitanteProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalEditarVisitante({
  isOpen,
  onClose,
}: ModalEditarVisitanteProps) {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date>()
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editarVisitanteSchema),
    defaultValues: {
      nombre_completo: "",
      fecha_visita: "",
      hora_estimada: "",
      tipo_visitante: "",
      motivo_visita: "",
    },
  })

  function onSubmit(data: FormValues) {
    console.log(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-6 rounded-2xl bg-white border-none shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pb-2">
          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer group"
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="h-8 w-8" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setValue("foto", file)
                  setFotoPreview(URL.createObjectURL(file))
                }
              }}
            />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Editar visitante
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Modifica los datos del visitante
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="nombre-completo">
              Nombre del visitante:
            </FieldLabel>
            <Input
              id="nombre-completo"
              className="bg-white"
              {...register("nombre_completo")}
            />
            {errors.nombre_completo && (
              <p className="text-sm text-destructive">
                {errors.nombre_completo.message}
              </p>
            )}
          </Field>

          <FieldGroup className="flex-row gap-3">
            <Field className="flex-1">
              <FieldLabel htmlFor="date-picker-fecha">
                Fecha de visita:
              </FieldLabel>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker-fecha"
                    className="w-full justify-between font-normal bg-white"
                  >
                    {date ? format(date, "dd/MM/yyyy") : "Seleccionar fecha"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    defaultMonth={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate)
                      setValue(
                        "fecha_visita",
                        selectedDate
                          ? format(selectedDate, "yyyy-MM-dd")
                          : "",
                        { shouldValidate: true },
                      )
                      setDatePickerOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.fecha_visita && (
                <p className="text-sm text-destructive">
                  {errors.fecha_visita.message}
                </p>
              )}
            </Field>

            <Field className="flex-1">
              <FieldLabel htmlFor="time-picker-fecha">
                Hora estimada:
              </FieldLabel>
              <Input
                type="time"
                id="time-picker-fecha"
                step="1"
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register("hora_estimada")}
              />
              {errors.hora_estimada && (
                <p className="text-sm text-destructive">
                  {errors.hora_estimada.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="tipo-visita">Tipo de visita:</FieldLabel>
            <Select
              onValueChange={(val) =>
                setValue("tipo_visitante", val, { shouldValidate: true })
              }
            >
              <SelectTrigger
                id="tipo-visita"
                className="bg-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visita Personal">
                  Visita Personal
                </SelectItem>
                <SelectItem value="Familiar">Familiar</SelectItem>
                <SelectItem value="Proveedor">Proveedor</SelectItem>
                <SelectItem value="Servicio">Servicio</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_visitante && (
              <p className="text-sm text-destructive">
                {errors.tipo_visitante.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="notas-adicionales">
              Notas adicionales:
            </FieldLabel>
            <Input
              id="notas-adicionales"
              className="bg-white"
              {...register("motivo_visita")}
            />
            {errors.motivo_visita && (
              <p className="text-sm text-destructive">
                {errors.motivo_visita.message}
              </p>
            )}
          </Field>

          <div className="flex gap-4 w-full pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50"
            >
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
