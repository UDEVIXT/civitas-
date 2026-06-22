import apiClient from "@/api/axios";
import type { Solicitud } from "../schema/solicitudSchema";

export interface AprobarMasivoResultado {
  total: number;
  aprobadas: number;
  fallidas: { id: string; motivo: string }[];
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001/api/"
).replace(/\/+$/, "");

// Construye la URL del endpoint protegido que hace streaming de la imagen de
// credencial INE. Nunca se usa/expone la URL pública de R2: el navegador
// adjunta la cookie de sesión automáticamente al pedir esta imagen.
export function obtenerUrlCredencial(id: string, lado: "frente" | "reverso"): string {
  return `${API_BASE_URL}/solicitud-administrador-guardia/${id}/credencial/${lado}`;
}

export const getSolicitudes = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get("/solicitud-administrador-guardia");
  return response.data;
};

export const getSolicitudById = async (id: string): Promise<Solicitud> => {
  const response = await apiClient.get(`/solicitud-administrador-guardia/${id}`);
  return response.data;
};

export const aprobarSolicitud = async (id: string): Promise<Solicitud> => {
  const response = await apiClient.patch(`/solicitud-administrador-guardia/${id}/aprobar`);
  return response.data;
};

export const rechazarSolicitud = async (id: string): Promise<Solicitud> => {
  const response = await apiClient.patch(`/solicitud-administrador-guardia/${id}/rechazar`);
  return response.data;
};

export const aprobarSolicitudesMasivo = async (ids: string[]): Promise<AprobarMasivoResultado> => {
  const response = await apiClient.patch("/solicitud-administrador-guardia/aprobar-masivo", { ids });
  return response.data;
};
