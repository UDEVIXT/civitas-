import apiClient from "@/api/axios";

export const loginRequest = async (
  usuario: string,
  password: string,
  recordarme: boolean,
) => {
  const response = await apiClient.post("/auth/login", {
    usuario,
    password,
    recordarme,
  });
  return response.data;
};

export const refreshRequest = async () => {
  const response = await apiClient.post("/auth/refresh");
  return response.data;
};

export const verifyCredentialRequest = async (
  rol: string,
  frente: File,
  reverso: File,
) => {
  const formData = new FormData();
  formData.append("rol", rol);
  formData.append("frente", frente);
  formData.append("reverso", reverso);

  const response = await apiClient.post("/auth/validar-credencial", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const registerRequest = async (data: {
  nombre: string;
  genero: string;
  fecha_nacimiento: string;
  telefono: string;
  nombre_usuario: string;
  correo: string;
  password: string;
  confirmPassword: string;
  rol: string;
  verificationAccessToken: string;
}) => {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
};
