import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMiPerfil, updateDatosPersonales } from "../api/perfil";

import {
  changePassword,
  requestEmailChange,
} from "../api/perfil.mock";
import {
  UpdatePerfilPayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
} from "../types";

export const usePerfil = () => {
  return useQuery({
    queryKey: ["perfil"],
    queryFn: getMiPerfil,
  });
};

export const useUpdatePerfil = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePerfilPayload) => updateDatosPersonales(data),
    onSuccess: (data) => {
      toast.success("Perfil actualizado correctamente");
      queryClient.setQueryData(["perfil"], data);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Ocurrió un error al actualizar el perfil."
      );
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => changePassword(data),
    onSuccess: () => {
      // CA002: el sistema actualiza la credencial y le confirma el cambio exitoso.
      toast.success("Contraseña actualizada con éxito.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al cambiar la contraseña.");
    },
  });
};

export const useChangeEmail = () => {
  return useMutation({
    mutationFn: (data: ChangeEmailPayload) => requestEmailChange(data),
    onSuccess: () => {
      // CA003: el sistema envía un enlace de verificación
      toast.success(
        "Se ha enviado un enlace de verificación a tu nuevo correo."
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al procesar el cambio de correo.");
    },
  });
};
