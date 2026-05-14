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

//Interfaces de APIs de residente y vivienda para filtros

export interface ResidenteData {
  id_residente: string;
  usuario: {
    id_usuario: string;
    persona: {
      nombre: string;
      url_imagen?: string;
    };
  };
}

export interface ResidenteResponse {
  success: boolean;
  data: ResidenteData[];
}

export interface ViviendaData {
  id_vivienda: string;
  numero_vivienda: string;
}
export interface ViviendaResponse {
  success: boolean;
  data: ViviendaData[];
}
