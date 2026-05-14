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
  Clock,
  User,
  Home,
  ShieldCheck,
  FileText,
  Camera,
} from "lucide-react";
import { useBitacoraDetalle } from "../hooks/useBitacora";
import { ReactQRCode } from "@lglab/react-qr-code";

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
  const {
    data: detalle,
    isLoading,
    error,
  } = useBitacoraDetalle(registroId || "");

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
      salida: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getMetodoAccesoIcon = (metodo: string) => {
    switch (metodo) {
      case "QR":
        return <QrCode className="h-5 w-5" />;
      case "lista":
        return <User className="h-5 w-5" />;
      case "manual":
        return <FileText className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-screen-2xl w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive">Error</DialogTitle>
            <DialogDescription>
              No se pudo cargar la información del registro.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Por favor, intente nuevamente más tarde.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!detalle?.data) {
    return null;
  }

  const registro = detalle.data;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[1200px] sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Detalle del Registro
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Visitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto del visitante */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {registro.avatar_url ? (
                    <img
                      src={registro.avatar_url}
                      alt={`Foto de ${registro.nombre}`}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                  ) : (
                    <Avatar className="w-20 h-20">
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
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{registro.nombre}</h3>
                  <Badge className={getTipoPersonaColor(registro.tipo_persona)}>
                    {registro.tipo_persona.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              {/* Residente asociado */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Residente asociado:</span>
                  <span className="text-muted-foreground">
                    {registro.residente_asociado?.nombre || "N/A"}
                  </span>
                </div>
                {registro.residente_asociado?.avatar_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Avatar residente:</span>
                    <Avatar className="w-8 h-8">
                      <img
                        src={registro.residente_asociado.avatar_url}
                        alt={`Avatar de ${registro.residente_asociado.nombre}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </Avatar>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de Acceso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Información de Acceso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Método de acceso */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  {getMetodoAccesoIcon(registro.metodo_acceso)}
                  <span className="font-medium capitalize">
                    {registro.metodo_acceso}
                  </span>
                </div>
                <Badge className={getEstadoColor(registro.estado)}>
                  {registro.estado}
                </Badge>
              </div>

              {/* QR utilizado */}
              {registro.metodo_acceso === "QR" && registro.qr_utilizado && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="h-4 w-4" />
                    <span className="font-medium text-sm">QR Utilizado</span>
                  </div>
                  <div className="bg-white p-4 rounded-lg flex justify-center">
                    <ReactQRCode value={registro.qr_utilizado} size={200} />
                  </div>
                  <div className="font-mono text-xs bg-background p-2 rounded border mt-2 text-center">
                    {registro?.qr_utilizado}
                  </div>
                </div>
              )}

              {/* Fechas y horas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Entrada:</span>
                  <span className="text-muted-foreground">
                    {registro.fecha_entrada
                      ? format(
                          new Date(registro.fecha_entrada),
                          "dd/MM/yyyy HH:mm:ss",
                          { locale: es },
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Hora exacta validación:</span>
                  <span className="text-muted-foreground">
                    {registro.hora_validacion
                      ? format(new Date(registro.hora_validacion), "HH:mm:ss", {
                          locale: es,
                        })
                      : "No registrada"}
                  </span>
                </div>
                {registro.fecha_salida && registro.fecha_salida !== "-" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Salida:</span>
                    <span className="text-muted-foreground">
                      {format(
                        new Date(registro.fecha_salida),
                        "dd/MM/yyyy HH:mm:ss",
                        { locale: es },
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Guardia que registró */}
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Guardia:</span>
                <span className="text-muted-foreground">
                  {registro.guardia_registro}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notas del Guardia */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas del Guardia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg min-h-[100px]">
                {registro.notas ? (
                  <p className="text-sm whitespace-pre-wrap">
                    {registro.notas}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No hay notas registradas para este acceso.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
