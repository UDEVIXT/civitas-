export type EmpleadoEstado = "Activo" | "Inactivo";
export interface FiltroEmpleado {
  isActive?: boolean | undefined;
  byResidenteId?: string | undefined;
  byViviendaId?: string | undefined;
}

export interface EmpleadoDomestico {
  id_visitante: string;
  nombre: string;
  telefono: string;
  url_imagen?: string;
  servicio: {
    activo: boolean;
    horario_texto: string;
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
}
