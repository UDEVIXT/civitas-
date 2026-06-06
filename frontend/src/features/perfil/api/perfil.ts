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

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await apiClient.put("perfil/cambiar-contrasena", {
    contrasena_actual: currentPassword,
    nueva_contrasena: newPassword,
  });
  return response.data;
};

export const updateGmail = async (nuevoCorreo: string) => {
  const response = await apiClient.put("perfil/cambiar-correo",
    {
      nuevoCorreo,
    }
  );

  return response.data;
};