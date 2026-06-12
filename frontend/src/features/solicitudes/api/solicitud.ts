import apiClient from "@/api/axios";
import type { Solicitud } from "../schema/solicitudSchema";

export const getSolicitudes = async (): Promise<Solicitud[]> => {
  const response = await apiClient.get("/solicitud-administrador-guardia");
  return response.data;
};

export const getSolicitudById = async (id: string): Promise<Solicitud> => {
  const response = await apiClient.get(`/solicitud-administrador-guardia/${id}`);
  return response.data;
};
