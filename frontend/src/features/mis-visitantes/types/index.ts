/*
Aquí definimos cómo se estructuran los visitantes basándonos en el diseño de Figma y en los Criterios de Aceptación.
*/

export type EstatusVisitante = "Activo" | "Expirado" | "Inactivo" | "Cancelado";
export type AccionQrVisitante = "habilitar" | "deshabilitar";

// CA002: Tipos de visitante
export type TipoVisitante =
  | "Visita Personal"
  | "Proveedor"
  | "Familiar"
  | "Servicio"
  | "Otro";

export interface Visitante {
  id_visitante: string;
  nombre_completo: string;
  motivo_visita: string;
  tipo_visitante: "Visita Personal" | "Familiar" | "Proveedor" | "Servicio" | "Otro";
  telefono: string;
  fecha_visita: string;
  hora_estimada: string;
  hora_salida: string;
  es_frecuente: boolean;
  estatus: "Activo" | "Inactivo" | "Expirado";
  url_foto?: string;
  notas_adicionales?: string;
  fecha_expiracion?: Date | string | null;
  id_acceso?: string;
  codigo_acceso?: string;
  estado_qr?: string;
  puede_generar_qr?: boolean;
}
