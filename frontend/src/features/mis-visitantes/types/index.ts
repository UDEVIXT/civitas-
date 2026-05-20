/*
Aquí definimos cómo se estructuran los visitantes basándonos en el diseño de Figma y en los Criterios de Aceptación. 
*/

export type EstatusVisitante = "Activo" | "Expirado" | "Cancelado";

// CA002: Tipos de visitante
export type TipoVisitante = "Visita Personal" | "Proveedor" | "Familiar" | "Servicio" | "Otro";

export interface Visitante {
  id_visitante: string;
  nombre_completo: string;
  motivo_visita: string; 
  tipo_visitante: TipoVisitante;
  fecha_visita: string;   // Formato YYYY-MM-DD
  hora_estimada: string;  // Formato HH:MM
  es_frecuente: boolean;  // Para la estrellita de favoritos
  codigo_acceso?: string; // QR o token
  estatus: EstatusVisitante;
  url_foto?: string;      // Avatar
}