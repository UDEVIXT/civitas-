"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ChevronDownIcon, Camera } from "lucide-react"
import Image from "next/image"

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
import type { Visitante } from "../types"
import {
  editarVisitanteSchema,
  type EditarVisitanteFormValues,
} from "../schemas/visitante.schema"
// Use a simple inline alert box (project has no shared Alert component)

function normalizeTimeLocal(value: string) {
  const raw = String(value || "").trim();
  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  const h24Match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (h24Match) {
    return `${String(Number(h24Match[1])).padStart(2, "0")}:${h24Match[2]}`;
  }
  return raw;
}

function isVisitInProgress(visitante?: Visitante | null) {
  if (!visitante?.fecha_visita || !visitante?.hora_estimada) return false;
  
  // 1. Si la tabla lo reporta como Inactivo o Expirado, liberamos campos para reciclar
  if (visitante.estatus !== "Activo") return false;

  try {
    const [y, m, d] = visitante.fecha_visita.split("-").map(Number);
    const [hhLlegada, mmLlegada] = normalizeTimeLocal(visitante.hora_estimada).split(":").map(Number);
    
    // Convertimos la hora de llegada a un objeto Date real
    const llegada = new Date(y, m - 1, d, hhLlegada, mmLlegada, 0, 0);
    const ahora = new Date();

    // 2. ¿Está en curso? 
    // Se bloquean los campos (retorna true) SOLAMENTE si la hora actual ya alcanzó o pasó la hora de llegada.
    return llegada <= ahora;
  } catch {
    return false;
  }
}

interface ModalEditarVisitanteProps {
  isOpen: boolean
  onClose: () => void
  visitante: Visitante | null
  onSave: (values: EditarVisitanteFormValues) => void | Promise<void>
  isSaving?: boolean
}

export function ModalEditarVisitante({
  isOpen,
  onClose,
  visitante,
  onSave,
  isSaving,
}: ModalEditarVisitanteProps) {
  const visitaEnCurso = isVisitInProgress(visitante)
  const [datePickerOpen, setDatePickerOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    visitante?.fecha_visita ? new Date(`${visitante.fecha_visita}T00:00:00`) : undefined,
  )
  const [fotoPreview, setFotoPreview] = React.useState<string | null>(
    visitante?.url_foto ?? null,
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const fotoObjectUrlRef = React.useRef<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditarVisitanteFormValues>({
    resolver: zodResolver(editarVisitanteSchema),
    defaultValues: {
      nombre_completo: "",
      telefono: "",
      fecha_visita: "",
      hora_estimada: "",
      hora_salida: "",
      tipo_visitante: "Otro",
      motivo_visita: "",
      notas_adicionales: "",
      // ✅ CORRECCIÓN 1: Zod exige este campo, lo inicializamos en falso
      es_frecuente: false, 
    },
  })

  React.useEffect(() => {
    if (!isOpen || !visitante) return
console.log("Datos que recibe el modal:", visitante); // <--- REVISA LA CONSOLA DEL NAVEGADOR
    // 1. Convertimos la fecha de string (YYYY-MM-DD) a objeto Date real
    const fechaComoDate = visitante?.fecha_visita 
      ? new Date(`${visitante.fecha_visita}T00:00:00`) 
      : undefined;
      
    setDate(fechaComoDate); // Esto actualizará el calendario visual

    reset({
      nombre_completo: visitante?.nombre_completo ?? "",
      telefono: (visitante?.telefono ?? "").replace(/\D/g, ""),
      fecha_visita: visitante?.fecha_visita ?? "", 
      hora_estimada: visitante?.hora_estimada ?? "",
      hora_salida: visitante?.hora_salida ?? "",
      tipo_visitante: (visitante?.tipo_visitante as any) ?? "Otro",
      motivo_visita: visitante?.motivo_visita ?? "",
      notas_adicionales: visitante?.notas_adicionales ?? "",
      es_frecuente: visitante?.es_frecuente ?? false,
    });
    if (fotoObjectUrlRef.current) {
      URL.revokeObjectURL(fotoObjectUrlRef.current)
      fotoObjectUrlRef.current = null
    }
  }, [isOpen, visitante, reset]);

  React.useEffect(() => {
    return () => {
      if (fotoObjectUrlRef.current) URL.revokeObjectURL(fotoObjectUrlRef.current)
    }
  }, [])

  const tipoVisitante = useWatch({
    control,
    name: "tipo_visitante",
  })

  function onSubmit(data: EditarVisitanteFormValues) {
    if (!isDirty) {
      onClose()
      return
    }

    // Si la visita está en curso, "filtramos" el objeto
    // para enviar única y exclusivamente las fechas, engañando a react-hook-form
    if (visitaEnCurso) {
      const datosParciales: Partial<EditarVisitanteFormValues> = {
        fecha_visita: data.fecha_visita,
        hora_salida: data.hora_salida,
      };
      
      void onSave(datosParciales as EditarVisitanteFormValues);
      return;
    }

    // Si no está en curso, enviamos todo normal
    void onSave(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-125 p-6 rounded-2xl bg-white border-none shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center text-center space-y-3 pb-2">
          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer group"
            >
              {fotoPreview ? (
                <Image
                  src={fotoPreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  fill
                  sizes="96px"
                  unoptimized
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
              disabled={visitaEnCurso}
              onChange={(e) => {
                if (visitaEnCurso) return
                const file = e.target.files?.[0]
                if (file) {
                  if (fotoObjectUrlRef.current) {
                    URL.revokeObjectURL(fotoObjectUrlRef.current)
                  }
                  const objectUrl = URL.createObjectURL(file)
                  fotoObjectUrlRef.current = objectUrl
                  setFotoPreview(objectUrl)
                  setValue("foto", file, { shouldDirty: true })
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

        {visitaEnCurso && (
          <div className="px-6">
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <strong className="block font-medium">La visita ya está en curso o la hora de llegada ha pasado.</strong>
              <span>Solo está permitida la modificación de la hora de salida.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field>
            <FieldLabel htmlFor="nombre-completo">
              Nombre del visitante:
            </FieldLabel>
            <Input
              id="nombre-completo"
              className="bg-white"
              {...register("nombre_completo")}
              disabled={visitaEnCurso}
            />
            {errors.nombre_completo && (
              <p className="text-sm text-destructive">
                {errors.nombre_completo.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="telefono">Número telefónico:</FieldLabel>
            <Input
              id="telefono"
              type="tel"
              maxLength={10}
              className="bg-white"
              {...register("telefono")}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setValue("telefono", val, { shouldValidate: true, shouldDirty: true });
              }}
              disabled={visitaEnCurso}
            />
            {errors.telefono && (
              <p className="text-sm text-destructive">{errors.telefono.message}</p>
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
                    disabled={visitaEnCurso}
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
                      if (visitaEnCurso) return
                      setDate(selectedDate)
                      setValue(
                        "fecha_visita",
                        selectedDate
                          ? format(selectedDate, "yyyy-MM-dd")
                          : "",
                        { shouldValidate: true, shouldDirty: true },
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
                
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register("hora_estimada")}
                disabled={visitaEnCurso}
              />
              {errors.hora_estimada && (
                <p className="text-sm text-destructive">
                  {errors.hora_estimada.message}
                </p>
              )}
            </Field>

            <Field className="flex-1">
              <FieldLabel htmlFor="time-picker-salida">
                Hora de salida:
              </FieldLabel>
              <Input
                type="time"
                id="time-picker-salida"

                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                {...register("hora_salida")}
                disabled={false}
              />
              {errors.hora_salida && (
                <p className="text-sm text-destructive">
                  {errors.hora_salida.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <Field>
            <FieldLabel htmlFor="tipo-visita">Tipo de visita:</FieldLabel>
            <Select
              disabled={visitaEnCurso}
              value={tipoVisitante}
              onValueChange={(val) =>
                setValue(
                  "tipo_visitante",
                  val as EditarVisitanteFormValues["tipo_visitante"],
                  { shouldValidate: true, shouldDirty: true },
                )
              }
            >
              <SelectTrigger
                id="tipo-visita"
                className="bg-white"
              >
                <SelectValue placeholder="Selecciona un tipo" />
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
              Motivo de la visita:
            </FieldLabel>
            <Input
              id="notas-adicionales"
              className="bg-white"
              {...register("motivo_visita")}
              disabled={visitaEnCurso}
            />
            {errors.motivo_visita && (
              <p className="text-sm text-destructive">
                {errors.motivo_visita.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="notas-adicionales-extra">
              Notas adicionales:
            </FieldLabel>
            <Input
              id="notas-adicionales-extra"
              className="bg-white"
              {...register("notas_adicionales")}
              disabled={visitaEnCurso}
            />
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
              disabled={isSaving}
            >
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
