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
  tipo_visitante: TipoVisitante;
  telefono: string;
  fecha_visita: string; // Formato YYYY-MM-DD
  hora_estimada: string; // Formato HH:MM
  fecha_expiracion?: string;
  es_frecuente: boolean; // Para la estrellita de favoritos
  id_acceso?: string;
  codigo_acceso?: string; // QR o token
  estado_qr?: "ACTIVO" | "EXPIRADO" | "INACTIVO" | "PENDIENTE_GENERACION";
  puede_generar_qr?: boolean;
  estatus: EstatusVisitante;
  url_foto?: string; // Avatar
}
