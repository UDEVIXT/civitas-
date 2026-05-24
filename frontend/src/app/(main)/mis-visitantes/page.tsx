"use client";

import React, { useState, useEffect } from "react";
import { Search, UserPlus, Filter, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Componentes
import { ModalVisitante } from "@/features/mis-visitantes/components/modal-visitante";
import { ModalQR } from "@/features/mis-visitantes/components/modal-qr/modalQR";
import { TablaVisitantes } from "@/features/mis-visitantes/components/tabla-visitantes";
import { EmptyStateVisitantes } from "@/features/mis-visitantes/components/empty-state-visitantes";
import type { VisitanteFormValues } from "@/features/mis-visitantes/schemas/visitante.schema";
import type { Visitante } from "@/features/mis-visitantes/types";
import { toast } from "sonner";

// Importamos la API
import {
  crearVisitante,
  generarQrVisitante,
  getVisitantes,
} from "@/features/mis-visitantes/api/visitante.api";

function getEstatusVisitante(ultimoAcceso: any, estadoQr?: string) {
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

function mapVisitanteFromBackend(v: any): Visitante {
  const ultimoAcceso = v.accesos?.[0];
  const estatus = getEstatusVisitante(ultimoAcceso, v.estado_qr);

  return {
    id_visitante: v.id_visitante,
    nombre_completo: v.nombre,
    motivo_visita: v.motivo || "Visita",
    tipo_visitante: v.motivo as any,
    telefono: v.telefono || "",
    fecha_visita: ultimoAcceso?.fecha_creacion
      ? new Date(ultimoAcceso.fecha_creacion).toISOString().split("T")[0]
      : "",
    fecha_expiracion: ultimoAcceso?.fecha_expiracion,
    hora_estimada: ultimoAcceso?.fecha_creacion
      ? new Date(ultimoAcceso.fecha_creacion).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "",
    es_frecuente: v.es_frecuente,
    estatus,
    id_acceso: ultimoAcceso?.id_acceso,
    codigo_acceso: ultimoAcceso?.codigo_qr,
    estado_qr: v.estado_qr,
    puede_generar_qr: estatus !== "Activo",
    url_foto: v.url_imagen,
  };
}

export default function MisVisitantesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Empezamos sin visitantes para ver el Empty State de Figma
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);

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

  const handleSaveVisitante = async (values: VisitanteFormValues) => {
    setIsSaving(true);
    try {
      // 1. Mandamos el FormData al back
      const responseBackend = await crearVisitante(values);
      console.log("Respuesta del backend con foto:", responseBackend);
      const ultimoAcceso = responseBackend?.accesos?.[0];
      const codigoQr = ultimoAcceso?.codigo_qr || "";

      // 2. Armamos el visitante para la tabla, mapeando la URL de la imagen
      const nuevoVisitante: Visitante = {
        id_visitante: responseBackend?.id_visitante || Math.random().toString(),
        nombre_completo: values.nombre_completo,
        motivo_visita: values.motivo_visita,
        tipo_visitante: values.tipo_visitante as any,
        fecha_visita: values.fecha_visita,
        hora_estimada: values.hora_estimada,
        fecha_expiracion: ultimoAcceso?.fecha_expiracion,
        es_frecuente: values.es_frecuente,
        telefono: values.telefono,
        estatus: "Activo",
        id_acceso: ultimoAcceso?.id_acceso,
        codigo_acceso: codigoQr,
        estado_qr: codigoQr ? "ACTIVO" : "PENDIENTE_GENERACION",
        puede_generar_qr: !codigoQr,
        url_foto: responseBackend?.url_imagen,
      };

      setVisitantes([nuevoVisitante, ...visitantes]);
      setIsModalOpen(false);
      if (codigoQr) {
        setQrValue(codigoQr);
        setIsQrModalOpen(true);
      }
      toast.success("Visitante registrado correctamente");
    } catch (error) {
      console.error("Error al registrar en la API:", error);
      toast.error("Hubo un problema al guardar el visitante.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCodigoAccesoClick = async (visitante: Visitante) => {
    const qrExpirado =
      visitante.fecha_expiracion &&
      new Date(visitante.fecha_expiracion) <= new Date();

    if (visitante.estatus === "Activo" && visitante.codigo_acceso && !qrExpirado) {
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
          variant="outline"
          className="bg-white hover:bg-gray-50 text-gray-700"
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
      ) : visitantes.length === 0 ? (
        <EmptyStateVisitantes />
      ) : (
        <TablaVisitantes
          visitantes={visitantes}
          onCodigoAccesoClick={handleCodigoAccesoClick}
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

      <ModalQR
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrValue={qrValue}
      />
    </div>
  );
}
