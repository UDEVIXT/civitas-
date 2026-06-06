import apiClient from "@/api/axios";
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3002/api";

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

  const response = await axios.post(
    `${BASE_URL}/auth/validar-credencial`,
    formData,
  );
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
  const response = await axios.post(`${BASE_URL}/auth/register`, data);
  return response.data;
};
