import apiClient from "@/api/axios";

export type TipoVisitaAPI = "Visitante" | "Proveedor" | "Empleado";
export type EstadoQrAPI = "Activo" | "Expirado" | "Desactivado";

export interface AccesoPreautorizado {
  id_acceso_preautorizado: string;
  nombre: string;
  informacion_general: string | null;
  propiedad: string;
  nombre_residente: string;
  fecha_llegada: string | null;
  fecha_salida: string | null;
  fecha_expiracion: string;
  tipo: TipoVisitaAPI;
  estado_qr?: EstadoQrAPI;
  tiene_nota: boolean;
  id_usuario: string;
  id_acceso: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function obtenerAccesosPreautorizados(): Promise<AccesoPreautorizado[]> {
  const res = await apiClient.get<AccesoPreautorizado[]>("acceso-preautorizado");
  return res.data;
}

export interface DecisionAccesoResponse {
  success: boolean;
  message: string;
}

export async function aceptarAccesoManual(
  idAcceso: string,
): Promise<DecisionAccesoResponse> {
  const response = await apiClient.post<DecisionAccesoResponse>(
    `empleado/${idAcceso}/aceptar`,
  );
  return response.data;
}

export async function rechazarAccesoManual(
  idAcceso: string,
  motivo: string,
): Promise<DecisionAccesoResponse> {
  const response = await apiClient.post<DecisionAccesoResponse>(
    `empleado/${idAcceso}/rechazar`,
    { motivo },
  );
  return response.data;
}
