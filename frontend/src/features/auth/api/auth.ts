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
