import { create } from "zustand";
import { loginRequest, refreshRequest } from "../api/auth";
import type { AuthState, User } from "../types";

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  isLoggingIn: false,

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const data = await loginRequest(
        credentials.usuario,
        credentials.password,
        credentials.recordarme,
      );
      localStorage.setItem("user", JSON.stringify(data.user));
      set({
        user: data.user,
        isAuthenticated: true,
        isLoggingIn: false,
      });
      return true;
    } catch (error) {
      set({ isLoggingIn: false });
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      await refreshRequest();

      if (storedUser) {
        set({ user: JSON.parse(storedUser) as User, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch {
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user, isAuthenticated: !!user });
  },
}));
