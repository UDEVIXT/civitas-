import apiClient from "@/api/axios";
import type { PerfilData } from "../types";

export const getMiPerfil = async (): Promise<PerfilData> => {
  const response = await apiClient.get<PerfilData>("perfil");
  return response.data;
};