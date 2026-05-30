import apiClient from "@/api/axios";
import type { PerfilData, UpdatePerfilPayload } from "../types";

export const getMiPerfil = async (): Promise<PerfilData> => {
  const response = await apiClient.get<PerfilData>("perfil");
  return response.data;
};

export const updateDatosPersonales = async (
  payload: UpdatePerfilPayload
): Promise<PerfilData> => {
  const response = await apiClient.put<PerfilData>("perfil", payload);
  return response.data;
};