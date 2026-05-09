export type PersonaBitacora = "visitante" | "empleado" | "proveedor";

export type MetodoAcceso = "QR" | "lista" | "manual";

export interface MiBitacoraItem {
  id_bitacora: string;
  id_visitante: string;
  nombre_persona: string;
  tipo_persona: PersonaBitacora;
  fecha_hora_entrada: string;
  fecha_hora_salida: string | null;
  metodo_acceso: MetodoAcceso;
  guardia: {
    id_guardia: string;
    nombre: string;
  };
  es_frecuente: boolean;
}

export interface MiBitacoraDetalle {
  id_bitacora: string;
  nombre_persona: string;
  tipo_persona: PersonaBitacora;
  fecha_hora_entrada: string;
  fecha_hora_salida: string | null;
  metodo_acceso: MetodoAcceso;
  guardia: {
    id_guardia: string;
    nombre: string;
  };
  es_frecuente: boolean;
  detalle: {
    foto_visitante: string | null;
    qr_utilizado: string | null;
    notas_guardia_entrada: string | null;
    notas_guardia_salida: string | null;
  };
}

export interface MiBitacoraResponse {
  success: boolean;
  data: MiBitacoraItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sort: "asc" | "desc";
  };
  frecuencia: {
    registros_totales: number;
    registros_frecuentes: number;
    accesos_unicos: number;
  };
  vivienda: {
    id_vivienda: string;
    numero_vivienda: string;
  };
}

export interface MiBitacoraDetalleResponse {
  success: boolean;
  data: MiBitacoraDetalle;
}

export interface MiBitacoraFilters {
  residentUserId?: string;
  residentName?: string;
  search?: string;
  personType?: PersonaBitacora;
  dateFrom?: string;
  dateTo?: string;
  sort?: "asc" | "desc";
  page?: number;
  limit?: number;
}
