import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getMiPerfil,
  updateDatosPersonales,
  updatePassword,
  updateGmail,
} from "../api/perfil";

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
    mutationFn: (data: UpdatePerfilPayload) =>
      updateDatosPersonales(data),

    onSuccess: (data) => {
      toast.success("Perfil actualizado correctamente");
      queryClient.setQueryData(["perfil"], data);
    },

    onError: (error: any) => {
      const serverMsg = error.response?.data?.message;

      const finalMsg = serverMsg
        ? Array.isArray(serverMsg)
          ? serverMsg.join(", ")
          : serverMsg
        : "Ocurrió un problema temporal al guardar tus cambios.";

      toast.error(finalMsg);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      updatePassword(
        data.passwordActual,
        data.passwordNuevo
      ),

    onSuccess: (response: any) => {
      toast.success(
        response?.message ||
          "Contraseña actualizada correctamente."
      );
    },

    onError: (error: any) => {
      const serverMsg = error.response?.data?.message;

      toast.error(
        Array.isArray(serverMsg)
          ? serverMsg.join(", ")
          : serverMsg ||
              "Error al cambiar la contraseña."
      );
    },
  });
};

export const useChangeEmail = () => {
  return useMutation({
    mutationFn: (data: ChangeEmailPayload) =>
      updateGmail(data.nuevoCorreo),

    onSuccess: (response: any) => {
      toast.success(
        response?.message ??
          "Se envió un enlace de confirmación a tu nuevo correo."
      );
    },

    onError: (error: any) => {
      const msg = error.response?.data?.message;

      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg ||
              "Error al procesar el cambio de correo."
      );
    },
  });
};