import apiClient from "@/api/axios";
import type { ServicioMock } from "../components/tabla-servicios";

export const obtenerMisServicios = async (): Promise<ServicioMock[]> => {
  const response = await apiClient.get<ServicioMock[]>("/mis-servicios");
  return response.data;
};

export const crearMiServicio = async (datosFormulario: FormData) => {
  // Mandamos el FormData porque incluye un archivo (la foto)
  const response = await apiClient.post("/mis-servicios", datosFormulario, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};