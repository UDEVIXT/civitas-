"use client";

import React, { useState, useEffect } from "react";
import { Search, UserPlus, Filter, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { actualizarVisitante } from "@/features/mis-visitantes/api/visitante.api";
// Componentes
import { ModalVisitante } from "@/features/mis-visitantes/components/modal-visitante";
import { ModalEditarVisitante } from "@/features/mis-visitantes/components/modal-editar-visitante";
import { ModalQR } from "@/features/mis-visitantes/components/modal-qr/modalQR";
import { ModalQRGestion } from "@/features/mis-visitantes/components/modal-qr/modalQR-gestion";
import { TablaVisitantes } from "@/features/mis-visitantes/components/tabla-visitantes";
import { EmptyStateVisitantes } from "@/features/mis-visitantes/components/empty-state-visitantes";
import type { VisitanteFormValues } from "@/features/mis-visitantes/schemas/visitante.schema";
import type {
  AccionQrVisitante,
  Visitante,
} from "@/features/mis-visitantes/types";
import { toast } from "sonner";

// Importamos la API
import {
  actualizarEstadoQrVisitante,
  crearVisitante,
  generarQrVisitante,
  getVisitantes,
} from "@/features/mis-visitantes/api/visitante.api";

type BackendEstatusAcceso = "Activo" | "Inactivo";
type BackendEstadoQr = NonNullable<Visitante["estado_qr"]>;

interface BackendAcceso {
  id_acceso: string;
  codigo_qr: string | null;
  fecha_creacion: string;
  fecha_visita_programada?: string | null;
  fecha_expiracion: string;
  fecha_salida_programada?: string | null;
  estatus: BackendEstatusAcceso;
}

interface BackendVisitante {
  id_visitante: string;
  nombre: string;
  tipo_visitante?: string | null;
  motivo?: string | null;
  fecha_visita?: string | null;
  hora_estimada?: string | null;
  hora_salida?: string | null;
  notas_adicionales?: string | null;
  telefono?: string | null;
  es_frecuente: boolean;
  url_imagen?: string | null;
  estado_qr?: BackendEstadoQr;
  accesos?: BackendAcceso[];
}

function getEstatusVisitante(
  ultimoAcceso?: Pick<BackendAcceso, "fecha_expiracion" | "estatus">,
  estadoQr?: BackendEstadoQr,
) {
  if (!ultimoAcceso) return "Inactivo" as const;

  const expiraEn = ultimoAcceso.fecha_expiracion
    ? new Date(ultimoAcceso.fecha_expiracion)
    : null;

  if (estadoQr === "EXPIRADO" || (expiraEn && expiraEn <= new Date())) {
    return "Expirado" as const;
  }

  if (estadoQr === "INACTIVO" || ultimoAcceso.estatus === "Inactivo") {
    return "Inactivo" as const;
  }

  return "Activo" as const;
}

function getFechaSinZonaHoraria(value?: string | null) {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
}

function getHoraSinZonaHoraria(value?: string | null) {
  if (!value) return "";
  const tiempo = value.includes("T") ? value.split("T")[1] : value;
  return tiempo.slice(0, 5);
}

function mapVisitanteFromBackend(v: BackendVisitante): Visitante {
  const ultimoAcceso = v.accesos?.[0];
  const estatus = getEstatusVisitante(ultimoAcceso, v.estado_qr);
  const fechaVisita =
    v.fecha_visita ??
    getFechaSinZonaHoraria(ultimoAcceso?.fecha_visita_programada ?? ultimoAcceso?.fecha_creacion);
  const horaEstimada =
    v.hora_estimada ??
    getHoraSinZonaHoraria(ultimoAcceso?.fecha_visita_programada ?? ultimoAcceso?.fecha_creacion);
  const horaSalida =
    v.hora_salida ??
    getHoraSinZonaHoraria(ultimoAcceso?.fecha_salida_programada ?? ultimoAcceso?.fecha_expiracion);

  return {
    id_visitante: v.id_visitante,
    nombre_completo: v.nombre,
    motivo_visita: v.motivo || "Visita",
    notas_adicionales: v.notas_adicionales || "",
    tipo_visitante: ((v.tipo_visitante || v.motivo || "Otro") as Visitante["tipo_visitante"]),
    telefono: v.telefono || "",
    fecha_visita: fechaVisita,
    fecha_expiracion: ultimoAcceso?.fecha_expiracion,
    hora_estimada: horaEstimada,
    hora_salida: horaSalida,
    es_frecuente: v.es_frecuente,
    estatus,
    id_acceso: ultimoAcceso?.id_acceso,
    codigo_acceso: ultimoAcceso?.codigo_qr ?? undefined,
    estado_qr: v.estado_qr,
    puede_generar_qr: estatus !== "Activo",
    url_foto: v.url_imagen ?? undefined,
  };
}

export default function MisVisitantesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visitanteEditando, setVisitanteEditando] = useState<Visitante | null>(
    null,
  );
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarFrecuentes, setMostrarFrecuentes] = useState(false);
  const [isQrGestionOpen, setIsQrGestionOpen] = useState(false);
  const [visitanteQrGestion, setVisitanteQrGestion] =
    useState<Visitante | null>(null);
  const [isUpdatingQr, setIsUpdatingQr] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);

  // Empezamos sin visitantes para ver el Empty State de Figma
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const visitantesFiltrados = mostrarFrecuentes
    ? visitantes.filter((visitante) => visitante.es_frecuente)
    : visitantes;

  useEffect(() => {
    const fetchVisitantes = async () => {
      try {
        const data = await getVisitantes();
        const mappedData: Visitante[] = data.map(mapVisitanteFromBackend);
        setVisitantes(mappedData);
      } catch (error) {
        console.error("Error fetching visitantes:", error);
        toast.error("No se pudieron cargar los visitantes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitantes();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisitantes((prev) =>
        prev.map((visitante) => {
          if (
            visitante.estatus !== "Activo" ||
            !visitante.fecha_expiracion ||
            new Date(visitante.fecha_expiracion) > new Date()
          ) {
            return visitante;
          }

          return {
            ...visitante,
            estatus: "Expirado",
            estado_qr: "EXPIRADO",
            puede_generar_qr: true,
          };
        }),
      );
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSaveVisitante = async (values: Partial<VisitanteFormValues>) => {
    setIsSaving(true);
    try {
      if (visitanteEditando) {
        // FLUJO DE EDICIÓN (PATCH) - FRONTEND
        const response = await actualizarVisitante(visitanteEditando.id_visitante, values);
        
        // 🔍 DIAGNÓSTICO: Esto nos dirá exactamente qué está escupiendo tu backend
        console.log("Respuesta completa de NestJS al guardar:", response);

        // ✅ CORRECCIÓN: Dependiendo de tu Axios, los datos pueden venir envueltos en .data o directos
        const accesoActualizado = response?.data?.codigo_qr 
            ? response.data 
            : response?.codigo_qr 
                ? response 
                : null;

        // 2. Actualizamos la tabla localmente
        setVisitantes((prev) =>
          prev.map((v) =>
            v.id_visitante === visitanteEditando.id_visitante
              ? {
                  ...v,
                  nombre_completo: values.nombre_completo ?? v.nombre_completo,
                  motivo_visita: values.motivo_visita ?? v.motivo_visita,
                  telefono: values.telefono ?? v.telefono,
                  es_frecuente: values.es_frecuente ?? v.es_frecuente,
                  tipo_visitante: (values.tipo_visitante ?? v.tipo_visitante) as Visitante["tipo_visitante"],
                  notas_adicionales: values.notas_adicionales ?? v.notas_adicionales,
                  hora_salida: values.hora_salida ?? v.hora_salida,
                  fecha_visita: values.fecha_visita ?? v.fecha_visita,
                  hora_estimada: values.hora_estimada ?? v.hora_estimada,
                  fecha_expiracion: values.hora_salida && values.fecha_visita
                    ? `${values.fecha_visita}T${values.hora_salida}:00`
                    : v.fecha_expiracion,
                  // Inyectamos el nuevo QR usando la variable inteligente
                  ...(accesoActualizado && {
                    id_acceso: accesoActualizado.id_acceso,
                    codigo_acceso: accesoActualizado.codigo_qr,
                    estatus: "Activo",
                    estado_qr: "ACTIVO",
                    puede_generar_qr: false,
                  }),
                }
              : v
          )
        );

        toast.success("Información del visitante actualizada con éxito");
      }else {
        // FLUJO DE CREACIÓN (POST)
        const fullValues = values as VisitanteFormValues;
        const responseBackend = await crearVisitante(fullValues);
        const ultimoAcceso = responseBackend?.accesos?.[0];
        const codigoQr = ultimoAcceso?.codigo_qr || "";

        const nuevoVisitante: Visitante = {
          id_visitante: responseBackend?.id_visitante || Math.random().toString(),
          nombre_completo: fullValues.nombre_completo,
          motivo_visita: fullValues.motivo_visita,
          tipo_visitante: fullValues.tipo_visitante as Visitante["tipo_visitante"],
          notas_adicionales: fullValues.notas_adicionales,
          fecha_visita:
            getFechaSinZonaHoraria(ultimoAcceso?.fecha_visita_programada ?? ultimoAcceso?.fecha_creacion) ||
            fullValues.fecha_visita,
          hora_estimada:
            getHoraSinZonaHoraria(ultimoAcceso?.fecha_visita_programada ?? ultimoAcceso?.fecha_creacion) ||
            fullValues.hora_estimada,
          hora_salida:
            getHoraSinZonaHoraria(ultimoAcceso?.fecha_salida_programada ?? ultimoAcceso?.fecha_expiracion) ||
            fullValues.hora_salida,
          fecha_expiracion: ultimoAcceso?.fecha_salida_programada ?? ultimoAcceso?.fecha_expiracion,
          es_frecuente: fullValues.es_frecuente,
          telefono: fullValues.telefono,
          estatus: "Activo",
          id_acceso: ultimoAcceso?.id_acceso,
          codigo_acceso: codigoQr,
          estado_qr: codigoQr ? "ACTIVO" : "PENDIENTE_GENERACION",
          puede_generar_qr: !codigoQr,
          url_foto: responseBackend?.url_imagen,
        };

        setVisitantes([nuevoVisitante, ...visitantes]);
        if (codigoQr) {
          setQrValue(codigoQr);
          setIsQrModalOpen(true);
        }
        toast.success("Visitante registrado correctamente");
      }

      // Limpieza de estados
      setIsModalOpen(false);
      setEditarModalOpen(false);
      setVisitanteEditando(null);
    } catch (error: any) {
      console.error("Error al guardar en la API:", error);
      let mensaje = "Hubo un problema al guardar los datos.";

      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        mensaje = Array.isArray(backendMessage) ? backendMessage.join(" | ") : String(backendMessage);
      }
      toast.error(mensaje);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditarClick = (visitante: Visitante) => {
    setVisitanteEditando(visitante);
    setEditarModalOpen(true);
  };

  const handleCodigoAccesoClick = async (visitante: Visitante) => {
    if (visitante.es_frecuente && visitante.codigo_acceso) {
      setVisitanteQrGestion(visitante);
      setIsQrGestionOpen(true);
      return;
    }

    const qrExpirado =
      visitante.fecha_expiracion &&
      new Date(visitante.fecha_expiracion) <= new Date();

    if (
      visitante.estatus === "Activo" &&
      visitante.codigo_acceso &&
      !qrExpirado
    ) {
      setQrValue(visitante.codigo_acceso);
      setIsQrModalOpen(true);
      return;
    }

    const confirmar = window.confirm(
      "Este visitante no tiene un QR activo. Si continuas, se dara de alta un nuevo codigo de acceso para permitir su entrada nuevamente.",
    );

    if (!confirmar) return;

    try {
      const response = await generarQrVisitante(visitante.id_visitante);
      const nuevoAcceso = response?.data;

      if (!nuevoAcceso?.codigo_qr) {
        toast.error("No se pudo generar el codigo QR.");
        return;
      }

      setVisitantes((prev) =>
        prev.map((item) =>
          item.id_visitante === visitante.id_visitante
            ? {
                ...item,
                id_acceso: nuevoAcceso.id_acceso,
                codigo_acceso: nuevoAcceso.codigo_qr,
                estado_qr: nuevoAcceso.estado_qr,
                fecha_expiracion: nuevoAcceso.fecha_expiracion,
                estatus: "Activo",
                puede_generar_qr: false,
              }
            : item,
        ),
      );

      setQrValue(nuevoAcceso.codigo_qr);
      setIsQrModalOpen(true);
      toast.success("Codigo QR generado correctamente");
    } catch (error) {
      console.error("Error al generar QR:", error);
      toast.error("Hubo un problema al generar el QR.");
    }
  };

  const handleActualizarEstadoQr = async (
    visitante: Visitante,
    accion: AccionQrVisitante,
    motivo?: string,
  ) => {
    setIsUpdatingQr(true);
    try {
      const response = await actualizarEstadoQrVisitante(
        visitante.id_visitante,
        { accion, motivo },
      );
      const accesoActualizado = response?.data;

      if (!accesoActualizado) {
        toast.error("No se pudo actualizar el estado del QR.");
        return;
      }

      const estatus = getEstatusVisitante(
        {
          fecha_expiracion: accesoActualizado.fecha_expiracion,
          estatus: accesoActualizado.estatus,
        },
        accesoActualizado.estado_qr,
      );

      setVisitantes((prev) =>
        prev.map((item) =>
          item.id_visitante === visitante.id_visitante
            ? {
                ...item,
                id_acceso: accesoActualizado.id_acceso,
                codigo_acceso: accesoActualizado.codigo_qr,
                fecha_expiracion: accesoActualizado.fecha_expiracion,
                estado_qr: accesoActualizado.estado_qr,
                estatus,
                puede_generar_qr: estatus !== "Activo",
              }
            : item,
        ),
      );

      setVisitanteQrGestion((actual) =>
        actual
          ? {
              ...actual,
              id_acceso: accesoActualizado.id_acceso,
              codigo_acceso: accesoActualizado.codigo_qr,
              fecha_expiracion: accesoActualizado.fecha_expiracion,
              estado_qr: accesoActualizado.estado_qr,
              estatus,
              puede_generar_qr: estatus !== "Activo",
            }
          : actual,
      );

      toast.success(response.message || "Estado del QR actualizado.");
    } catch (error: unknown) {
      console.error("Error al actualizar estado del QR:", error);
      let mensaje = "Hubo un problema al actualizar el estado del QR.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        mensaje = error.response.data.message;
      }

      toast.error(mensaje);
    } finally {
      setIsUpdatingQr(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Visitantes</h1>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search" className="pl-9 bg-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="outline"
          className="bg-white hover:bg-gray-50 text-gray-700"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo
        </Button>
        <Button
          onClick={() => setMostrarFrecuentes((prev) => !prev)}
          variant="outline"
          className={
            mostrarFrecuentes
              ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "bg-white hover:bg-gray-50 text-gray-700"
          }
        >
          <Star className="mr-2 h-4 w-4 text-amber-400" /> Favoritos
        </Button>
        <Button
          variant="outline"
          className="bg-white hover:bg-gray-50 text-gray-700"
        >
          <Filter className="mr-2 h-4 w-4" /> Más filtros
        </Button>
      </div>

      {/* Si está cargando mostra un spinner, si es 0 muestra Empty State, si no, dibuja la tabla */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : visitantesFiltrados.length === 0 ? (
        <EmptyStateVisitantes />
      ) : (
        <TablaVisitantes
          visitantes={visitantesFiltrados}
          onCodigoAccesoClick={handleCodigoAccesoClick}
          onEditarClick={handleEditarClick}
        />
      )}

      {isModalOpen && (
        <ModalVisitante
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVisitante}
          isSaving={isSaving}
        />
      )}

      {editarModalOpen && visitanteEditando && (
        <ModalEditarVisitante
          isOpen={editarModalOpen}
          visitante={visitanteEditando}
          onClose={() => {
            setEditarModalOpen(false);
            setVisitanteEditando(null);
          }}
          onSave={handleSaveVisitante}
          isSaving={isSaving}
        />
      )}

      <ModalQR
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrValue={qrValue}
      />

      <ModalQRGestion
        isOpen={isQrGestionOpen}
        visitante={visitanteQrGestion}
        isLoading={isUpdatingQr}
        onClose={() => {
          setIsQrGestionOpen(false);
          setVisitanteQrGestion(null);
        }}
        onConfirmAction={handleActualizarEstadoQr}
      />
    </div>
  );
}
