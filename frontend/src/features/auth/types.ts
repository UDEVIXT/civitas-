export interface AuthState {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  isLoggingIn: boolean;
  login: (credentials: {
    usuario: string;
    password: string;
    recordarme: boolean;
  }) => Promise<boolean>;
}
