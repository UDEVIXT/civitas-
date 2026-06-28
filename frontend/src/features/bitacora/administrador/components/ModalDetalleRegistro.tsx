"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QrCode,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  Camera,
  ListCheck,
  NotebookPen,
} from "lucide-react";

import { ReactQRCode } from "@lglab/react-qr-code";
import { useBitacoraDetalleAdmin } from "../hooks/useBitacoraAdmin";

interface ModalDetalleRegistroProps {
  isOpen: boolean;
  onClose: () => void;
  registroId: string | null;
}

export function ModalDetalleRegistro({
  isOpen,
  onClose,
  registroId,
}: ModalDetalleRegistroProps) {
  const { data: detalle, isLoading, error } = useBitacoraDetalleAdmin(registroId || "");

  if (!registroId) return null;

  const getTipoPersonaColor = (tipo: string) => {
    const colors: Record<string, string> = {
      visitante: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      residente: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      empleado_domestico: "bg-teal-100 text-teal-800 hover:bg-teal-100",
      proveedor: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };
    return colors[tipo] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      entrada: "bg-green-100 text-green-800",
      dentro: "bg-green-100 text-green-800",
      salida: "bg-red-100 text-red-800",
      fuera: "bg-red-100 text-red-800",
      excedido: "bg-yellow-100 text-yellow-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getMetodoAccesoIcon = (metodo: string) => {
    const normalized = (metodo || "").trim().toLowerCase();
    switch (normalized) {
      case "qr": return <QrCode className="h-5 w-5" />;
      case "lista": return <ListCheck className="h-5 w-5" />;
      case "manual": return <NotebookPen className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* mismo DialogContent responsive (ver abajo) */}
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-[1200px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive">Error</DialogTitle>
            <DialogDescription>
              No se pudo cargar la información del registro.
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-muted-foreground py-4">
            Por favor, intenta nuevamente más tarde.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!detalle?.data) return null;

  const registro = detalle.data as typeof detalle.data & {
    empresa?: string;
    servicio_nombre?: string;
    placas?: string;
    motivo?: string;
    notas?: string;
    comentario_salida?: string;
    qr_utilizado?: string;
    hora_validacion?: string;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      
      <DialogContent className="w-[95vw] sm:max-w-none max-w-[95vw] md:max-w-[900px] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-lg p-4 sm:p-6">

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Detalle del Registro
          </DialogTitle>
        </DialogHeader>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-2">

          {/* ── INFORMACIÓN DEL VISITANTE ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                Información del Visitante
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Avatar + nombre */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {registro.avatar_url ? (
                    <img
                      src={registro.avatar_url}
                      alt={`Foto de ${registro.nombre}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border"
                    />
                  ) : (
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                        {registro.nombre
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!registro.avatar_url && (
                    <div className="absolute -bottom-1 -right-1 bg-muted rounded-full p-1">
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {registro.nombre}
                  </h3>
                  <Badge className={getTipoPersonaColor(registro.tipo_persona)}>
                    {registro.tipo_persona.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Residente asociado */}
              <div className="flex items-start gap-2 text-sm flex-wrap">
                <span className="font-medium shrink-0">Residente asociado:</span>
                <div className="flex items-center gap-2">
                  {registro.residente_asociado?.avatar_url && (
                    <Avatar className="w-6 h-6">
                      <img
                        src={registro.residente_asociado.avatar_url}
                        alt={registro.residente_asociado.nombre}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </Avatar>
                  )}
                  <span className="text-muted-foreground">
                    {registro.residente_asociado?.nombre || "N/A"}
                    {registro.residente_asociado?.vivienda && ` (${registro.residente_asociado.vivienda})`}
                  </span>
                </div>
              </div>

              {/* Empresa / Servicio / Placas / Motivo */}
              {(registro.empresa || registro.placas || registro.motivo || registro.servicio_nombre) && (
                <div className="space-y-2 pt-3 border-t text-sm">
                  {registro.empresa && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-medium shrink-0">Empresa:</span>
                      <span className="text-muted-foreground">{registro.empresa}</span>
                    </div>
                  )}
                  {registro.servicio_nombre && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-medium shrink-0">Servicio:</span>
                      <span className="text-muted-foreground">{registro.servicio_nombre}</span>
                    </div>
                  )}
                  {registro.placas && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-medium shrink-0">Placas:</span>
                      <span className="text-muted-foreground">{registro.placas}</span>
                    </div>
                  )}
                  {registro.motivo && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-medium shrink-0">Motivo:</span>
                      <span className="text-muted-foreground">{registro.motivo}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── INFORMACIÓN DE ACCESO ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5" />
                Información de Acceso
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Método + estado */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  {getMetodoAccesoIcon(registro.metodo_acceso)}
                  <span className="font-medium capitalize text-sm">
                    {registro.metodo_acceso?.trim().toLowerCase() === "qr"
                      ? "QR"
                      : registro.metodo_acceso?.trim()}
                  </span>
                </div>
                <Badge className={getEstadoColor(registro.estado)}>
                  {registro.estado}
                </Badge>
              </div>

              {/* QR — ancho completo y centrado */}
              {registro.metodo_acceso?.trim().toUpperCase() === "QR" &&
                registro.qr_utilizado && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium text-sm">QR Utilizado</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg flex justify-center">
                      {/* QR se adapta: max 180px en móvil, 200px en desktop */}
                        <div className="w-full max-w-[180px]">
                          <ReactQRCode
                            value={registro.qr_utilizado}
                            size={180}
                          />
                        </div>
                      
                    </div>
                    <p className="font-mono text-xs bg-background p-2 rounded border mt-2 text-center break-all">
                      {registro.qr_utilizado}
                    </p>
                  </div>
                )}

              {/* Fechas */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 flex-wrap">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="font-medium shrink-0">Entrada:</span>
                  <span className="text-muted-foreground">
                    {registro.fecha_entrada &&
                      !isNaN(new Date(registro.fecha_entrada).getTime())
                      ? format(new Date(registro.fecha_entrada), "dd/MM/yyyy HH:mm:ss", { locale: es })
                      : "N/A"}
                  </span>
                </div>

                {registro.fecha_salida &&
                  !isNaN(new Date(registro.fecha_salida).getTime()) && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="font-medium shrink-0">Salida:</span>
                      <span className="text-muted-foreground">
                        {format(new Date(registro.fecha_salida), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                      </span>
                    </div>
                  )}
              </div>

              {/* Guardia */}
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">Guardia:</span>
                <span className="text-muted-foreground">{registro.guardia_registro}</span>
              </div>
            </CardContent>
          </Card>

          {/* ── NOTAS ── */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Notas de entrada del Guardia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 sm:p-4 bg-muted rounded-lg min-h-[80px] sm:min-h-[100px]">
                {registro.notas ? (
                  <p className="text-sm whitespace-pre-wrap">{registro.notas}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No hay notas registradas para este acceso.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {registro.fecha_salida && registro.fecha_salida !== "-" && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5" />
                  Notas de salida del Guardia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 sm:p-4 bg-muted rounded-lg min-h-[80px] sm:min-h-[100px]">
                  {registro.comentario_salida ? (
                    <p className="text-sm whitespace-pre-wrap">{registro.comentario_salida}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No hay notas registradas para la salida.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}