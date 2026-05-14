export interface User {
  id: number;
  nombre: string;
  rol: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoggingIn: boolean;
  login: (credentials: {
    usuario: string;
    password: string;
    recordarme: boolean;
  }) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}
