import { create } from "zustand";
import { loginRequest } from "../api/auth";
import type { AuthState } from "../types";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  isLoggingIn: false,

  login: async (credentials: {
    usuario: string;
    password: string;
    recordarme: boolean;
  }) => {
    set({ isLoggingIn: true });
    try {
      const { data } = await loginRequest(
        credentials.usuario,
        credentials.password,
        credentials.recordarme,
      );
      set({
        user: data.user,
        isAuthenticated: true,
        isLoggingIn: false,
      });
      return true;
    } catch (error) {
      console.error(error);
      set({
        isAuthenticated: false,
        isLoggingIn: false,
      });
      throw error;
    }
  },
}));
