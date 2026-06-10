import apiClient from "@/api/axios";
import type { ServicioMock } from "../components/tabla-servicios";

export const obtenerMisServicios = async (): Promise<ServicioMock[]> => {
  const response = await apiClient.get<ServicioMock[]>("/mis-servicios");
  return response.data;
};