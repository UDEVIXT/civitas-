import apiClient from "@/api/axios";
import type { ServicioDomicilio } from "../types/index";

/**
 * NUEVA FUNCIÓN: Obtiene los servicios a domicilio asociados exclusivamente al residente autenticado
 * Mapeado directamente a la estructura limpia que espera la tabla de la interfaz
 */
export const obtenerMisServicios = async (): Promise<ServicioDomicilio[]> => {
  try {
    // Le pega al endpoint '/mis-servicios' que creamos en tu NestJS
    const response = await apiClient.get<ServicioDomicilio[]>("/mis-servicios");
    return response.data;
  } catch (error) {
    console.error("🔴 Error en obtenerMisServicios API:", error);
    // Retornamos un arreglo vacío como fallback seguro para que no se congele el front
    return [];
  }
};