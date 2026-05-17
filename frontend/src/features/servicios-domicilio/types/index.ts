export type FrecuenciaServicio = "UNICA_VEZ" | "RECURRENTE" | "PROGRAMADO";

export interface TipoServicio {
  id_tipo_servicio: string;
  nombre: string;         // Ej. "Gas", "Agua", "Internet"
  descripcion?: string;
  categoria: string;
}

export interface HorarioServicio {
  id_horario?: string;
  hora_inicio: string;    // Formato "HH:MM"
  hora_fin: string;       // Formato "HH:MM"
  dia_semana: string;     // LUNES, MARTES, etc.
  activo: boolean;
}

// Representa la estructura que devuelve tu Backend
export interface ServicioDomicilio {
  id_servicio: string;
  nombre_servicio: string; // Para el formulario puede ser el identificador o alias
  nombre_empresa: string | null;
  tipo_carro: string | null;
  placas: string | null;
  rfc: string | null;
  activo: boolean;
  id_tipo_servicio: string | null;
  fecha_registro: string;
  
  // Relaciones opcionales incluidas por Prisma
  tipo_servicio?: TipoServicio | null;
  horarios?: HorarioServicio[];
  
  // Datos específicos de la visita/repartidor mapeados en el UI
  nombre_tecnico?: string;
  fecha_visita?: string;     // Formato "YYYY-MM-DD"
  frecuencia: FrecuenciaServicio;
  notas?: string;
}