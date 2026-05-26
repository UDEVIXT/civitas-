import {
  PerfilData,
  UpdatePerfilPayload,
  ChangePasswordPayload,
  ChangeEmailPayload,
} from "../types";

// Mock user data
let mockUser: PerfilData = {
  id: "user-123",
  nombre: "Juan",
  apellidos: "Pérez",
  telefono: "5512345678",
  correo: "juan.perez@example.com",
  rol: "residente",
  fechaRegistro: "2023-01-15T10:00:00Z",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getMiPerfil = async (): Promise<PerfilData> => {
  await delay(800);
  return { ...mockUser };
};

export const updateDatosPersonales = async (
  payload: UpdatePerfilPayload
): Promise<PerfilData> => {
  await delay(1000);
  // Simular error aleatorio temporal CA012 (comentar para no fallar siempre, o depender del input)
  if (payload.nombre === "Error 500") {
     throw new Error("Error interno del servidor al guardar los cambios.");
  }
  
  mockUser = { ...mockUser, ...payload };
  return { ...mockUser };
};

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  await delay(1000);
  
  // CA007: Contraseña actual incorrecta
  if (payload.passwordActual !== "Actual123!") {
    throw new Error("La contraseña actual no es correcta.");
  }
};

export const requestEmailChange = async (
  payload: ChangeEmailPayload
): Promise<void> => {
  await delay(1000);
  
  // CA009: Correo ya en uso
  if (payload.nuevoCorreo === "usado@ejemplo.com" || payload.nuevoCorreo === "test@test.com") {
    throw new Error("El correo electrónico ingresado ya está en uso por otra cuenta.");
  }
};
