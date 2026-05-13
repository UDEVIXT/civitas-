export type EmpleadoEstado = "Activo" | "Inactivo";
export interface FiltroEmpleado {
  isActive?: boolean | undefined;
  byResidenteId?: string | undefined;
  byViviendaId?: string | undefined;
}

export interface HorarioServicio {
  dia_semana: string;
  hora_inicio: Date;
  hora_fin: Date;
}

export interface EmpleadoDomestico {
  id_visitante: string;
  nombre: string;
  telefono: string;
  url_imagen?: string;
  servicio: {
    activo: boolean;
    fecha_registro: Date;
    horarios: HorarioServicio[];
    tipo_servicio: {
      nombre: string;
      categoria: string;
    };
  };
  residente: {
    vivienda: {
      numero_vivienda: string;
    };
  };
}

export interface EmpleadoDomesticoMetadata {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
export interface EmpleadoDomesticoResponse {
  success: boolean;
  data: EmpleadoDomestico[];
  meta: EmpleadoDomesticoMetadata;
  message?: string;
  error?: string;
  statusCode?: number;
}
